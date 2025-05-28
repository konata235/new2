import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const { plantname, price, instock } = req.body;

    if (!plantname || price == null || instock == null) {
      return res.status(400).json({ message: '参数缺失：plantname, price, instock 必填' });
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [result] = await connection.execute(
      'INSERT INTO `sale message` (plantname, price, instock) VALUES (?, ?, ?)',
      [plantname, price, instock]
    );

    await connection.end();

    res.status(200).json({ message: '新增成功', insertId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
}
