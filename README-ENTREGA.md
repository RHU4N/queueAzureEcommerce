# Roteiro de evidências

1. Abra a Storage Account usada no projeto Blob.
2. Entre em `Data storage → Queues`.
3. Mostre a queue `vendas-pendentes`.
4. Execute `npm install` e `npm start`.
5. Abra `http://localhost:3000`.
6. Preencha uma venda.
7. Clique em `Confirmar venda`.
8. Mostre a mensagem de sucesso.
9. Abra a queue no Azure e mostre a mensagem recebida.
10. Explique o fluxo:

Venda confirmada → JSON → Queue Storage → processamento posterior → geração da NF.

A aplicação não precisa gerar a NF nesta atividade; o objetivo é demonstrar o envio da transação para a fila para processamento posterior.
