require("dotenv").config();

const express = require("express");
const path = require("path");
const { QueueClient } = require("@azure/storage-queue");

const app = express();
const PORT = process.env.PORT || 3000;

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const queueName = process.env.AZURE_QUEUE_NAME || "vendas-pendentes";

if (!connectionString) {
  console.error("ERRO: configure AZURE_STORAGE_CONNECTION_STRING no arquivo .env");
  process.exit(1);
}

const queueClient = new QueueClient(connectionString, queueName);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Rota principal: funciona localmente e na Vercel
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function garantirFila() {
  await queueClient.createIfNotExists();
}

app.post("/api/vendas", async (req, res) => {
  try {
    const {
      cliente,
      email,
      produto,
      quantidade,
      valorUnitario,
      formaPagamento
    } = req.body;

    if (!cliente || !email || !produto || !quantidade || !valorUnitario || !formaPagamento) {
      return res.status(400).json({ erro: "Preencha todos os dados da venda." });
    }

    const quantidadeNumero = Number(quantidade);
    const valorUnitarioNumero = Number(valorUnitario);

    if (!Number.isFinite(quantidadeNumero) || quantidadeNumero <= 0 ||
        !Number.isFinite(valorUnitarioNumero) || valorUnitarioNumero <= 0) {
      return res.status(400).json({ erro: "Quantidade e valor unitário devem ser válidos." });
    }

    const venda = {
      id: `VENDA-${Date.now()}`,
      data: new Date().toISOString(),
      status: "PENDENTE_NF",
      cliente: { nome: cliente, email },
      item: {
        produto,
        quantidade: quantidadeNumero,
        valorUnitario: valorUnitarioNumero
      },
      total: Number((quantidadeNumero * valorUnitarioNumero).toFixed(2)),
      formaPagamento
    };

    await garantirFila();

    // Queue Storage armazena mensagens como texto.
    // O objeto da venda é serializado em JSON antes do envio.
    const mensagem = JSON.stringify(venda);
    const respostaAzure = await queueClient.sendMessage(mensagem);

    res.status(201).json({
      sucesso: true,
      mensagem: "Venda confirmada e enviada para a fila.",
      venda,
      messageId: respostaAzure.messageId,
      queue: queueName
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({
      erro: "Não foi possível enviar a venda para o Azure Queue Storage."
    });
  }
});

// Apenas para demonstração: consulta sem remover mensagens.
app.get("/api/fila", async (req, res) => {
  try {
    await garantirFila();

    const resposta = await queueClient.peekMessages({ numberOfMessages: 32 });

    const mensagens = resposta.peekedMessageItems.map((mensagem) => ({
      id: mensagem.messageId,
      inseridaEm: mensagem.insertedOn,
      expiraEm: mensagem.expiresOn,
      conteudo: mensagem.messageText
    }));

    res.json({
      fila: queueName,
      quantidade: mensagens.length,
      mensagens
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Não foi possível consultar a fila." });
  }
});

// Exporta o Express para a Vercel.
module.exports = app;

// Execução local: na Vercel, o runtime gerencia o servidor.
if (require.main === module) {
  iniciarServidor();
}
