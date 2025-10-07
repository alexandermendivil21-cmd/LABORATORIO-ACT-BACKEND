const mensajeError = document.getElementById("msg");
const form = document.getElementById('registerForm');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const elems = form.elements;
  const payload = {
    tipo_documento: elems['tipo_documento'].value,
    num_documento: elems['num_documento'].value,
    fecha_emision: elems['fecha_emision'].value,
    password_create: elems['password_create'].value,
    mayor: elems['mayor'].checked,
    menor: elems['menor'].checked,
    tipo_usuario: elems['Tipo_usuario'] ? elems['Tipo_usuario'].value : 'paciente',
    Tipo_usuario: elems['Tipo_usuario'] ? elems['Tipo_usuario'].value : 'paciente',
    nombres: elems['nombres'].value,
    apellidos: elems['apellidos'].value,
    edad: parseInt(elems['edad'].value),
    genero: elems['genero'].value,
    direccion: elems['direccion'].value,
    celular: elems['celular'].value
  };
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const resJson = await res.json();
    if (!res.ok) {
      mensajeError.textContent = resJson.message || "Error al registrar.";
      mensajeError.style.color = "red";
      return;
    }
    if(resJson.redirect){
      window.location.href = resJson.redirect;
    }
  } catch (err) {
    console.error('Error en fetch:', err);
  }
});
