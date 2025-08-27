# React コーディング規約

## ファイル構成

### ディレクトリ構造
```
src/
  components/
    common/          # 共通コンポーネント
    pages/           # ページ固有のコンポーネント
  hooks/             # カスタムフック
  utils/             # ユーティリティ関数
  types/             # 型定義
  constants/         # 定数
```

### ファイル命名規則
- コンポーネントファイル: PascalCase (例: `UserProfile.tsx`)
- フック: camelCase + "use" prefix (例: `useUserData.ts`)
- ユーティリティ: camelCase (例: `formatDate.ts`)
- 型定義: PascalCase + "Type" suffix (例: `UserType.ts`)

## コンポーネント設計

### 関数コンポーネント
```typescript
// 良い例
interface UserProfileProps {
  userId: string;
  onUpdate: (user: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  userId, 
  onUpdate 
}) => {
  // コンポーネントの実装
  return <div>...</div>;
};
```

### Props の型定義
```typescript
// インターフェースを使用
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}
```

### useState の使用
```typescript
// 型を明示的に指定
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState<boolean>(false);
```

### useEffect の使用
```typescript
// 依存配列を適切に設定
useEffect(() => {
  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await api.getUser(userId);
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, [userId]); // 依存配列に userId を含める
```

## カスタムフック

### 命名規則
- "use" プレフィックスを付ける
- 機能を表す分かりやすい名前にする

### 実装例
```typescript
// useUserData.ts
export const useUserData = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // データ取得ロジック
  }, [userId]);

  return { user, loading, error };
};
```

## スタイリング

### CSS Modules または styled-components を推奨
```typescript
// CSS Modules の場合
import styles from './UserProfile.module.css';

export const UserProfile: React.FC<Props> = () => {
  return <div className={styles.container}>...</div>;
};
```

```typescript
// styled-components の場合
import styled from 'styled-components';

const Container = styled.div`
  padding: 1rem;
  border-radius: 8px;
`;
```

## エラーハンドリング

### エラーバウンダリーの使用
```typescript
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

## パフォーマンス最適化

### React.memo の使用
```typescript
export const UserCard = React.memo<UserCardProps>(({ user }) => {
  return <div>...</div>;
});
```

### useMemo と useCallback の適切な使用
```typescript
const MemoizedComponent: React.FC<Props> = ({ items, onItemClick }) => {
  // 重い計算の結果をメモ化
  const processedItems = useMemo(() => {
    return items.map(item => processItem(item));
  }, [items]);

  // コールバック関数をメモ化
  const handleClick = useCallback((id: string) => {
    onItemClick(id);
  }, [onItemClick]);

  return <div>...</div>;
};
```

## テスト

### Jest + React Testing Library を使用
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  test('renders user information', () => {
    const user = { id: '1', name: 'Test User' };
    render(<UserProfile user={user} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  test('calls onUpdate when edit button is clicked', () => {
    const mockOnUpdate = jest.fn();
    const user = { id: '1', name: 'Test User' };
    
    render(<UserProfile user={user} onUpdate={mockOnUpdate} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(mockOnUpdate).toHaveBeenCalledWith(user);
  });
});
```