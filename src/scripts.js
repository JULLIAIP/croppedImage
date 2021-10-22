//carregar a foto
const photoFile = document.getElementById("photo-file");
var imagePreview = document.getElementById("photo-preview");
var image;
let photoName;

// redireciona o clique do imput pro botao
document.getElementById("select-image").onclick = function () {
  photoFile.click();
};

window.addEventListener("DOMContentLoaded", () => {
  photoFile.addEventListener("change", () => {
    //onde fica salvo o navegador?
    let file = photoFile.files.item(0);
    photoName = file.name;

    //ler um arquivo
    let reader = new FileReader();

    //qual dado ele vai ler?
    reader.readAsDataURL(file);

    //depois de ler como ele renderiza na tela?
    reader.onload = function (event) {
      image = new Image();
      image.onload = onLoadImage;
      image.src = event.target.result;
    };
  });
});

//ações com a foto
const selection = document.getElementById("selection-tool");

let startX,
  startY,
  relativeStartX,
  relativeStartY,
  endX,
  endY,
  relativeEndX,
  relativeEndY;

let startSelection = false;

const events = {
  mouseover() {
    this.style.cursor = "crosshair";
  },
  mousedown() {
    const { clientX, clientY, offsetX, offsetY } = event;

    startX = clientX;
    startY = clientY;
    relativeStartX = offsetX;
    relativeStartY = offsetY;

    startSelection = true;
  },
  mousemove(event) {
    endX = event.clientX;
    endY = event.clientY;
    if (startSelection) {
      selection.style.display = "initial";
      selection.style.top = startY + "px";
      selection.style.left = startX + "px";
      selection.style.width = endX - startX + "px";
      selection.style.height = endY - startY + "px";
    }
  },
  mouseup() {
    startSelection = false;

    relativeEndX = event.layerX;
    relativeEndY = event.layerY;
    //mostrar o botão de cortar
    cropButton.style.display = "initial";
  },
};
//constroi um array com as chaves do objto
Object.keys(events).forEach((eventName) => {
  //addEventListener('mouseover', events.mouseover);
  imagePreview.addEventListener(eventName, events[eventName]);
});

//criando o canvas
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

function onLoadImage() {
  const { width, height } = image;
  canvas.width = width;
  canvas.height = height;
  //limpar o ctx
  ctx.clearRect(0, 0, width, height);
  //desenhar
  ctx.drawImage(image, 0, 0);
  imagePreview.src = canvas.toDataURL();
}
//cortar imagem
const cropButton = document.getElementById("crop-image");
cropButton.onclick = () => {
  const { width: imgW, height: imgH } = image;
  const { width: previewW, height: previewH } = imagePreview;

  const widthFactor = imgW / previewW;
  const heigthFactor = imgH / previewH;

  const selectionWidth = [selection.style.width.replace("px", "")];
  const selectionHeigth = [selection.style.height.replace("px", "")];

  const [croppedWidth, croppedHeight] = [
    +(selectionWidth * widthFactor),
    +(selectionHeigth * heigthFactor),
  ];
  const [actualX, actualY] = [
    +(relativeStartX * widthFactor),
    +(relativeStartY * heigthFactor),
  ];

  //pegar do contexto do canvas a seleção
  const croppedImage = ctx.getImageData(
    actualX,
    actualY,
    croppedWidth,
    croppedHeight
  );

  //limpar o canvas
  ctx.clearRect(0, 0, ctx.width, ctx.height);

  //ajuste de proporção
  image.width = canvas.width = croppedWidth;
  image.height = canvas.height = croppedHeight;

  //adcionar ao canvas
  ctx.putImageData(croppedImage, 0, 0);

  //esconder cursor
  selection.style.display = "none";

  //atualizar o preview
  imagePreview.src = canvas.toDataURL();

  //mostrar botão de download
  downloadButton.style.display = "initial";
};

//Download
const downloadButton = document.getElementById("down-image");
downloadButton.onclick = function () {
  const a = document.createElement("a");
  a.download = photoName + "-cropped.png";
  a.href = canvas.toDataURL();
  a.click();
};
