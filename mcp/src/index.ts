#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs';
import * as path from 'path';

// サーバーのメタデータ
const SERVER_INFO = {
  name: 'project-conventions-mcp',
  version: '2.0.0',
};

// サポートするカテゴリの定義
const CATEGORIES = {
  'coding-rules': {
    directory: 'coding_rules',
    displayName: 'Coding Rules',
    description: 'Programming conventions and coding standards'
  },
  'domain-knowledge': {
    directory: 'domain_knowledge',
    displayName: 'Domain Knowledge',
    description: 'Business domain knowledge and specifications'
  }
} as const;

type CategoryKey = keyof typeof CATEGORIES;

class ProjectConventionsServer {
  private server: Server;
  private resourcesPath: string;

  constructor() {
    this.server = new Server(
      {
        name: SERVER_INFO.name,
        version: SERVER_INFO.version,
      },
      {
        capabilities: {
          resources: {},
        },
      }
    );

    // リソースディレクトリのパスを設定
    // ビルド後は build/resources になるため、実行時のディレクトリから相対パスで取得
    this.resourcesPath = path.resolve(__dirname, '../resources');
    
    this.setupHandlers();
  }

  private setupHandlers() {
    // リソースリスト取得のハンドラー
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      try {
        const resources: any[] = [];

        // 各カテゴリのファイルを取得
        for (const [categoryKey, categoryInfo] of Object.entries(CATEGORIES)) {
          const files = await this.getCategoryMarkdownFiles(categoryKey as CategoryKey);
          
          for (const file of files) {
            resources.push({
              uri: `${categoryKey}://${file}`,
              mimeType: 'text/markdown',
              name: file,
              description: `${categoryInfo.displayName}: ${file}`,
              annotations: {
                category: categoryKey,
                displayName: categoryInfo.displayName
              }
            });
          }
        }

        return { resources };
      } catch (error) {
        throw new Error(`Failed to list resources: ${error}`);
      }
    });

    // リソース読み取りのハンドラー
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;
      
      // URIからカテゴリとファイル名を解析
      const { category, filename } = this.parseUri(uri);
      
      if (!category || !filename) {
        throw new Error(`Invalid URI format: ${uri}`);
      }

      try {
        const content = await this.readCategoryMarkdownFile(category, filename);
        return {
          contents: [
            {
              uri,
              mimeType: 'text/markdown',
              text: content
            }
          ]
        };
      } catch (error) {
        throw new Error(`Failed to read resource ${filename} from ${category}: ${error}`);
      }
    });
  }

  private parseUri(uri: string): { category: CategoryKey | null, filename: string | null } {
    for (const categoryKey of Object.keys(CATEGORIES) as CategoryKey[]) {
      const schemePrefix = `${categoryKey}://`;
      if (uri.startsWith(schemePrefix)) {
        return {
          category: categoryKey,
          filename: uri.replace(schemePrefix, '')
        };
      }
    }
    
    return { category: null, filename: null };
  }

  private async getCategoryMarkdownFiles(category: CategoryKey): Promise<string[]> {
    try {
      const categoryPath = path.join(this.resourcesPath, CATEGORIES[category].directory);
      
      // カテゴリディレクトリが存在しない場合は空配列を返す
      if (!fs.existsSync(categoryPath)) {
        return [];
      }

      const files = await fs.promises.readdir(categoryPath);
      return files.filter(file => path.extname(file).toLowerCase() === '.md');
    } catch (error) {
      throw new Error(`Cannot read category directory ${category}: ${error}`);
    }
  }

  private async readCategoryMarkdownFile(category: CategoryKey, filename: string): Promise<string> {
    const categoryPath = path.join(this.resourcesPath, CATEGORIES[category].directory);
    const filepath = path.join(categoryPath, filename);
    
    // セキュリティ: パストラバーサル攻撃を防ぐ
    const resolvedPath = path.resolve(filepath);
    const categoryResolvedPath = path.resolve(categoryPath);
    
    if (!resolvedPath.startsWith(categoryResolvedPath)) {
      throw new Error(`Access denied: ${filename}`);
    }

    // ファイルの存在確認
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File not found: ${filename}`);
    }

    try {
      const content = await fs.promises.readFile(resolvedPath, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`Cannot read file ${filename}: ${error}`);
    }
  }

  // デバッグ用: 利用可能なカテゴリ情報を取得
  public getAvailableCategories() {
    return CATEGORIES;
  }

  // デバッグ用: 特定のカテゴリの利用可能ファイルを取得
  public async getCategoryFiles(category: CategoryKey) {
    return await this.getCategoryMarkdownFiles(category);
  }

  async run() {
    // STDIO トランスポートを使用
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // サーバー終了時のクリーンアップ
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.server.close();
      process.exit(0);
    });
  }
}

// メイン実行部分
if (require.main === module) {
  const server = new ProjectConventionsServer();
  server.run().catch(error => {
    console.error('Server error:', error);
    process.exit(1);
  });
}

export { ProjectConventionsServer };