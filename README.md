# Lista de Tarefas

Aplicação web de lista de tarefas desenvolvida para o Teste Inicial de Programação.

## Funcionalidades

- Adicionar tarefa com título, descrição, data prevista e status.
- Listar tarefas com busca por título, descrição, data ou status.
- Editar tarefa existente.
- Excluir tarefa com confirmação.
- Filtrar por status.
- Visualizar tarefas em lista e calendário.
- Validar título obrigatório.
- Validar data prevista obrigatória e válida.
- Persistir os dados no `localStorage` do navegador.
- Abrir tarefa no Google Calendar por link pré-preenchido.
- Baixar arquivo `.ics` para importar em Google Calendar, Outlook, Apple Calendar e outros calendários compatíveis.

## Tecnologias

- Next.js
- React
- TypeScript
- CSS
- Lucide React
- `localStorage`
- Vercel

## Integração com agenda

A solução implementa integração sem credenciais externas usando:

- Link para Google Calendar com os dados da tarefa preenchidos.
- Exportação `.ics`, baseada no padrão iCalendar.

Uma integração direta com Google Calendar API ou Microsoft Graph Calendar API também é possível, mas exigiria OAuth, credenciais do provedor e fluxo de autorização do usuário. Para o escopo do teste, a abordagem por link e `.ics` entrega interoperabilidade sem aumentar a complexidade operacional.

## Estrutura

```text
.
+-- src/app
+-- src/components
+-- src/lib
+-- package.json
+-- README.md
+-- RELATO.md
```

## Decisões técnicas

A aplicação foi migrada para Next.js e React para deixar a entrega mais próxima de um projeto front-end moderno. A persistência permanece em `localStorage` para manter o teste simples de executar e publicar, sem depender de criação de banco externo ou variáveis de ambiente.
