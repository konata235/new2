import mysql from 'mysql2/promise';
import { verifyToken } from './jwt';

export default async function handler(req, res) {
  // 设置允许跨域（根据实际需求调整）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 验证 token，拿到 account
  const decoded = verifyToken(req);
  if (!decoded) {
    return res.status(401).json({ message: '缺少或无效的认证信息' });
  }

  const account = decoded.account;

  const { timestamp, items, total } = req.body;

  if (!timestamp || !items || total == null) {
    return res.status(400).json({ message: '缺少参数：timestamp, items, total 必填' });
  }

  // 确保 items 是字符串
  const itemsStr = typeof items === 'string' ? items : JSON.stringify(items);

  // 调试输出，确认接收到的内容
  console.log('准备插入订单：', { account, timestamp, items: itemsStr, total });

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4',
    });

    // 确保连接使用utf8mb4编码
    await connection.query("SET NAMES utf8mb4");

    const [result] = await connection.execute(
      'INSERT INTO orders (account, timestamp, items, total) VALUES (?, ?, ?, ?)',
      [account, timestamp, itemsStr, total]
    );

    await connection.end();

    return res.status(200).json({ message: '订单创建成功', insertId: result.insertId });
  } catch (error) {
    console.error('数据库插入错误:', error);
    return res.status(500).json({ message: '服务器错误', error: error.message });
  }
}
