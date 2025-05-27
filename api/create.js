import mysql from 'mysql2/promise';
import { verifyToken } from './jwt'; // 注意路径根据你的项目结构调整

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const decoded = verifyToken(req);
  if (!decoded) return res.status(401).json({ message: '缺少或无效的认证信息' });

  const account = decoded.account;
  const { timestamp, items, total } = req.body;

  if (!timestamp || !items || total == null) {
    return res.status(400).json({ message: '缺少参数：timestamp, items, total 必填' });
  }

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [result] = await connection.execute(
      'INSERT INTO orders (account, timestamp, items, total) VALUES (?, ?, ?, ?)',
      [account, timestamp, items, total]
    );

    await connection.end();
    res.status(200).json({ message: '订单创建成功', insertId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
}
