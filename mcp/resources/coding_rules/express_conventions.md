# Express.js コーディング規約

## プロジェクト構成

### ディレクトリ構造
```
src/
  controllers/       # リクエストハンドリング
  services/          # ビジネスロジック
  models/           # データモデル
  middlewares/      # ミドルウェア
  routes/           # ルート定義
  utils/            # ユーティリティ関数
  types/            # 型定義
  config/           # 設定ファイル
  tests/            # テストファイル
```

### ファイル命名規則
- コントローラー: camelCase + "Controller" suffix (例: `userController.ts`)
- サービス: camelCase + "Service" suffix (例: `userService.ts`)
- ミドルウェア: camelCase + "Middleware" suffix (例: `authMiddleware.ts`)
- ルート: camelCase + "Routes" suffix (例: `userRoutes.ts`)

## アプリケーション構成

### メインアプリケーションファイル
```typescript
// app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/errorHandler';
import userRoutes from './routes/userRoutes';

const app = express();

// セキュリティミドルウェア
app.use(helmet());
app.use(cors());

// パースミドルウェア
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ルート設定
app.use('/api/users', userRoutes);

// エラーハンドリング
app.use(errorHandler);

export default app;
```

### サーバー起動ファイル
```typescript
// server.ts
import app from './app';
import { config } from './config/database';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

## コントローラー

### 基本的な構造
```typescript
// controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { CreateUserRequest, UpdateUserRequest } from '../types/userTypes';

export const userController = {
  // ユーザー一覧取得
  getUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  },

  // ユーザー詳細取得
  getUserById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  // ユーザー作成
  createUser: async (req: Request<{}, {}, CreateUserRequest>, res: Response, next: NextFunction) => {
    try {
      const userData = req.body;
      const newUser = await userService.createUser(userData);
      
      res.status(201).json({
        success: true,
        data: newUser
      });
    } catch (error) {
      next(error);
    }
  }
};
```

## サービス層

### ビジネスロジックの分離
```typescript
// services/userService.ts
import { User, CreateUserData } from '../types/userTypes';
import { userModel } from '../models/userModel';
import { hashPassword } from '../utils/encryption';

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    return await userModel.findAll();
  },

  getUserById: async (id: string): Promise<User | null> => {
    return await userModel.findById(id);
  },

  createUser: async (userData: CreateUserData): Promise<User> => {
    // バリデーション
    if (!userData.email || !userData.password) {
      throw new Error('Email and password are required');
    }

    // パスワードのハッシュ化
    const hashedPassword = await hashPassword(userData.password);

    const newUserData = {
      ...userData,
      password: hashedPassword
    };

    return await userModel.create(newUserData);
  }
};
```

## ルート定義

### RESTful なルート設計
```typescript
// routes/userRoutes.ts
import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateUser } from '../middlewares/validationMiddleware';

const router = Router();

// 公開エンドポイント
router.post('/', validateUser, userController.createUser);
router.post('/login', userController.loginUser);

// 認証が必要なエンドポイント
router.use(authMiddleware); // この下のすべてのルートに認証が必要

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', validateUser, userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
```

## ミドルウェア

### エラーハンドリングミドルウェア
```typescript
// middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  console.error(`Error: ${err.message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

### 認証ミドルウェア
```typescript
// middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('Access token is required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};
```

### バリデーションミドルウェア
```typescript
// middlewares/validationMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const validateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = userSchema.validate(req.body);
  
  if (error) {
    const message = error.details.map(detail => detail.message).join(', ');
    next(new AppError(message, 400));
  } else {
    next();
  }
};
```

## 型定義

### リクエスト・レスポンス型
```typescript
// types/userTypes.ts
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
```

## 設定管理

### 環境変数の管理
```typescript
// config/index.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET!,
  databaseUrl: process.env.DATABASE_URL!,
  redisUrl: process.env.REDIS_URL
};

// 必須環境変数のチェック
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Environment variable ${envVar} is required`);
  }
});
```

## テスト

### API テスト
```typescript
// tests/userController.test.ts
import request from 'supertest';
import app from '../app';
import { userService } from '../services/userService';

jest.mock('../services/userService');
const mockUserService = userService as jest.Mocked<typeof userService>;

describe('User Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    test('should return all users', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@example.com' }
      ];
      
      mockUserService.getAllUsers.mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockUsers
      });
    });
  });

  describe('POST /api/users', () => {
    test('should create a new user', async () => {
      const newUser = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123'
      };

      const createdUser = { ...newUser, id: '1' };
      mockUserService.createUser.mockResolvedValue(createdUser);

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: createdUser
      });
    });
  });
});
```

## セキュリティ

### 基本的なセキュリティ対策
```typescript
// app.ts にセキュリティ設定を追加
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

// レート制限
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100 // リクエスト数の上限
});

app.use('/api/', limiter);

// MongoDB injection対策
app.use(mongoSanitize());

// XSS対策
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    }
  }
}));
```