const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  console.log('req', req.header('Authorization'))
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log("tokennn", token);
  console.log("Hola mundo")

  const claveSecreta = process.env.JWT_SECRET

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    // Decodificar el token
    console.log("clave", claveSecreta);
    const decoded = jwt.verify(token, claveSecreta);
    req.usuario = decoded;  // Establece el usuario decodificado en req.usuario
    next();  // Pasa al siguiente middleware o controlador
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = authMiddleware;
