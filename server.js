const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const users = require('./users');
const preguntas = require('./preguntas');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ==============================
// RUTA: LOGIN
// ==============================
app.post("/api/login", (req, res) => {
  const { usuario, password } = req.body;

  console.log("🔍 Datos recibidos en /api/login:", req.body);

  const user = users.find(
    (u) => u.cuenta === usuario && u.contrasena === password
  );

  if (user) {
    console.log(`✅ Usuario "${usuario}" ha iniciado sesión correctamente.`);
    res.json({
      message: `Bienvenido, ${user.nombreCompleto}`,
      user: user
    });
  } else {
    console.log(`❌ Falló login para usuario: "${usuario}"`);
    res.status(401).json({ message: "Usuario o contraseña incorrectos." });
  }
});

// ==============================
// RUTA: PAGO
// ==============================
app.post("/api/pago", (req, res) => {
  const { cuenta } = req.body;

  const user = users.find(u => u.cuenta === cuenta);

  if (!user) {
    console.log(`❌ Pago fallido: usuario "${cuenta}" no encontrado.`);
    return res.status(404).json({ message: "Usuario no encontrado." });
  }

  if (user.pago) {
    console.log(`⚠️ Usuario "${cuenta}" intentó pagar dos veces.`);
    return res.status(400).json({ message: "Ya has pagado esta certificación." });
  }

  user.pago = true;
  console.log(`💰 Usuario "${cuenta}" ha pagado la certificación.`);
  res.json({ message: "Pago realizado exitosamente." });
});

// ==============================
// RUTA: LOGOUT
// ==============================
app.post('/api/logout', (req, res) => {
  const { usuario } = req.body;
  console.log(`🚪 Usuario "${usuario}" ha cerrado sesión.`);
  res.json({ message: 'Sesión finalizada correctamente.' });
});

// ==============================
// RUTA: OBTENER 8 PREGUNTAS ALEATORIAS
// ==============================
app.get('/api/preguntas', (req, res) => {
  // Mezclar y seleccionar 8 preguntas aleatorias
  const preguntasAleatorias = [...preguntas]
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);
  
  console.log(`📘 Enviando ${preguntasAleatorias.length} preguntas aleatorias al frontend.`);
  
  res.json(preguntasAleatorias);
});

// ==============================
// RUTA: ENVIAR EXAMEN Y REVISAR RESPUESTAS
// ==============================
app.post('/api/examen', (req, res) => {
  const { cuenta, respuestas, tiempoRestante } = req.body;

  console.log('📝 Examen recibido para revisión:');
  console.log(`   Usuario: ${cuenta}`);
  console.log(`   Tiempo restante: ${tiempoRestante} segundos`);
  console.log(`   Respuestas enviadas:`, respuestas);

  let correctas = 0;
  const resultados = [];

  // Revisar cada respuesta
  Object.keys(respuestas).forEach(preguntaId => {
    const pregunta = preguntas.find(p => p.id === parseInt(preguntaId));
    const respuestaUsuario = respuestas[preguntaId];
    
    if (pregunta) {
      const esCorrecta = respuestaUsuario === pregunta.respuesta;
      if (esCorrecta) correctas++;
      
      resultados.push({
        preguntaId: pregunta.id,
        pregunta: pregunta.texto,
        respuestaUsuario: respuestaUsuario,
        respuestaCorrecta: pregunta.respuesta,
        esCorrecta: esCorrecta
      });
    }
  });

  const total = Object.keys(respuestas).length;
  const calificacion = ((correctas / total) * 100).toFixed(2);
  const aprobado = calificacion >= 75; // 75% como mínimo para aprobar

  console.log(`🧮 Resultado del examen para ${cuenta}:`);
  console.log(`   Correctas: ${correctas}/${total}`);
  console.log(`   Calificación: ${calificacion}%`);
  console.log(`   Aprobado: ${aprobado ? 'SÍ' : 'NO'}`);

  res.json({
    correctas,
    total,
    calificacion,
    aprobado,
    resultados: resultados,
    mensaje: aprobado 
      ? `¡Felicidades! Aprobaste con ${calificacion}%` 
      : `No aprobaste. Obtuviste ${calificacion}%, necesitas 75% para aprobar.`
  });
});

// ==============================
// RUTA: CONTACTO
// ==============================
app.post('/api/contacto', (req, res) => {
  const { nombre, email, mensaje } = req.body;
  console.log('📩 Nuevo mensaje desde la sección de contacto:');
  console.log(`   Nombre: ${nombre}`);
  console.log(`   Email: ${email}`);
  console.log(`   Mensaje: ${mensaje}`);
  res.json({ message: 'Mensaje recibido correctamente en el servidor.' });
});

// ==============================
// INICIO DEL SERVIDOR
// ==============================
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});

