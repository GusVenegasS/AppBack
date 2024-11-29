const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }
  
  try {
    // Decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta');
    req.usuario = decoded;  // Establece el usuario decodificado en req.usuario
    next();  // Pasa al siguiente middleware o controlador
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = authMiddleware;
