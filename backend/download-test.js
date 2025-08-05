
const fetch = require('node-fetch');  // Se non l'hai già, fai npm install node-fetch@2
const fs = require('fs');

(async () => {
  const url = 'https://48ec23054b63.ngrok-free.app/moodle/pluginfile.php/1/local_configuratore/attachments/11/Lezione08_Impronte_Sensori.pdf?token=1d10616e5f3ef11d6e04fe8ab9d5b8d2';
  const res = await fetch(url);
  console.log('HTTP STATUS:', res.status);
  if (res.ok) {
    const dest = fs.createWriteStream('./test_download.pdf');
    res.body.pipe(dest);
    res.body.on('end', () => {
      console.log('File scaricato!');
    });
  } else {
    const text = await res.text();
    console.error('Errore:', text);
  }
})();
