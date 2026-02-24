const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (err.code === 'P2002') return res.status(409).json({ error: 'Registro já existe' });
  if (err.code === 'P2025') return res.status(404).json({ error: 'Registro não encontrado' });
  return res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor' });
};
module.exports = { errorHandler };
