const pup = require("puppeteer");
const shell = require("shelljs");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
// const merge = require('./index2')

const url = "http://omnissolucoes.com/teste3/";



(async () => {
  const browser = await pup.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url);

  const dataArray = await page.evaluate(() => {
    const nome = document.querySelectorAll("li");
    const links = document.querySelectorAll("a");

    const arrayNomes = [...nome];
    const arrayLinks = [...links];
    const listNomes = arrayNomes.map((itens) => ({
      nome: itens.innerText,
    }));
    const listLinks = arrayLinks.map((itens) => ({
      links: itens.href,
    }));
    const cod = arrayLinks.map((item) => ({
      codigo: item.getAttribute("codigo"),
    }));

    const arrayGeral = [{ ...listNomes }, { ...listLinks }, { ...cod }];

    return arrayGeral;
  });

  const [nome, link, codigo] = dataArray;
  const doc = await PDFDocument.create();

  for (let cod in codigo) {
    const nomeCodigo = codigo[cod].codigo;
    await page.waitForSelector(`a[codigo="${nomeCodigo}`);
    await page.click(`a[codigo="${nomeCodigo}"]`);
    await page.waitForTimeout(2000);
    await shell.cp(
      `../../Downloads/${nomeCodigo}.pdf`,
      `./pdfs/${nomeCodigo}.pdf`
    );

    const pdf = await PDFDocument.load(fs.readFileSync(`./pdfs/${nomeCodigo}.pdf`));
    

    const content = await doc.copyPages(pdf, pdf.getPageIndices());
    for (const page of content) {
      doc.addPage(page);
    }

  }
  await page.waitForTimeout(2000);
  await fs.writeFileSync("./unificado.pdf", await doc.save());

  await page.goto("http://127.0.0.1:5500/unificado.pdf");


  await page.waitForTimeout(5000);
  await browser.close();
})();
