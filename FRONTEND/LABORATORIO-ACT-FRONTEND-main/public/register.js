const mensajeError = document.getElementById("msg");
const form = document.getElementById('registerForm');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const elems = form.elements;
  const payload = {
    tipo_documento: elems['tipo_documento'].value,
    num_documento: elems['num_documento'].value,
    email: elems['email'].value,
    password_create: elems['password_create'].value
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
