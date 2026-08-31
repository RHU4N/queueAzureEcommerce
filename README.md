# 🛒 Queue Storage - Ecommerce

Atividade 4 de Computação em Nuvem II: simulação de confirmação de venda de ecommerce usando Azure Queue Storage.

## O que o projeto faz

Ao clicar em **Confirmar venda**, o Node.js recebe os dados, cria uma transação em JSON e envia essa mensagem para a fila `vendas-pendentes`.

```text
Ecommerce
   ↓
Confirmar venda
   ↓
Node.js / Express
   ↓
JSON da transação
   ↓
Azure Queue Storage
   ↓
Pendente de processamento
   ↓
Futuro worker → geração da NF
```

A aula explica Queue Storage como um serviço de mensagens e destaca desacoplamento, processamento posterior e nivelamento de carga. A mensagem é tratada como texto/bytes; o schema pode ficar no JSON enviado pela aplicação.

## Azure

Você pode usar **a mesma Storage Account do projeto Blob Storage**.

No Azure Portal:

```text
Storage Account
  → Data storage
  → Queues
  → + Queue
```

Crie:

```text
vendas-pendentes
```

Nomes de queue devem usar minúsculas, números e hífens.

Depois vá em:

```text
Security + networking
  → Access keys
```

Copie uma **Connection string**.

## Configuração

Na pasta do projeto:

```bash
npm install
```

Crie `.env` a partir de `.env.example`:

```env
AZURE_STORAGE_CONNECTION_STRING=SUA_CONNECTION_STRING
AZURE_QUEUE_NAME=vendas-pendentes
```

Depois:

```bash
npm start
```

Abra:

```text
http://localhost:3000
```

A aplicação também executa `createIfNotExists()`, portanto garante que a queue exista.

## Teste

Preencha cliente, e-mail, produto, quantidade, valor e pagamento.

Clique em:

```text
Confirmar venda
```

Uma mensagem semelhante será enviada:

```json
{
  "id": "VENDA-...",
  "data": "2026-08-30T...",
  "status": "PENDENTE_NF",
  "cliente": {
    "nome": "Rhuan Santana",
    "email": "cliente@email.com"
  },
  "item": {
    "produto": "Teclado Mecânico",
    "quantidade": 1,
    "valorUnitario": 199.90
  },
  "total": 199.90,
  "formaPagamento": "PIX"
}
```

## Evidência

No Azure Portal:

```text
Storage Account
  → Queues
  → vendas-pendentes
```

Mostre a mensagem criada.

A aplicação também possui o botão **Visualizar mensagens da fila**, que usa `peekMessages()` e não remove a mensagem.

## Segurança

Nunca publique a Connection String.

O `.gitignore` já ignora:

```text
.env
node_modules/
```

## Futuro processamento

A atividade diz que as vendas serão usadas posteriormente para gerar notas fiscais. Este projeto deixa a mensagem pendente na fila. Um worker futuro poderia:

```text
receiveMessages()
      ↓
processar venda
      ↓
gerar NF
      ↓
deleteMessage(messageId, popReceipt)
```

Se o processamento falhar, a mensagem pode voltar a ficar disponível para tentativa posterior.

## Autor

Rhuan Santana — Fatec Cotia — 2026
