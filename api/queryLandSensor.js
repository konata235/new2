import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  // 设置 CORS 头部
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // 创建数据库连接（使用 mysql2/promise）
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: 'test999'
    });

    // 查询整张表
    const [rows] = await connection.execute('SELECT * FROM `land and sensor`');

    // 返回查询结果
    res.status(200).json({ message: 'Query successful', data: rows });

    await connection.end();
  } catch (error) {
    res.status(500).json({ message: 'Query failed', error: error.message });
  }
}
