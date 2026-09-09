document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  const target = document.querySelector(link.getAttribute('href'));
  if (target) { event.preventDefault(); target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
}));
document.querySelectorAll('[data-billing]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-billing]').forEach(b=>b.classList.remove('active'));button.classList.add('active');document.querySelectorAll('.price').forEach(price=>price.textContent=price.dataset[button.dataset.billing])}));
document.querySelector('#newsletter').addEventListener('submit',event=>{event.preventDefault();const email=document.querySelector('#email');document.querySelector('#signupStatus').textContent=`Thanks — updates will go to ${email.value}.`;event.currentTarget.reset()});
