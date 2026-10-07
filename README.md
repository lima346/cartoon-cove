# Cartoon Stream Hub

Crie uma plataforma web profissional de streaming de vídeos, focada em desenhos animados, séries, vídeos de memes e conteúdos criados com Inteligência Artificial (IA).

O site deve funcionar como uma plataforma de entretenimento onde os utilizadores podem entrar, descobrir conteúdos, assistir aos vídeos organizados por episódios e, em determinados conteúdos, pagar para desbloquear os episódios premium.

1. PÁGINA INICIAL

Criar uma homepage moderna, responsiva e visualmente semelhante a uma plataforma de streaming.

Elementos:

Logo da plataforma

Menu: Início, Desenhos, Memes, Séries, Novidades, Categorias

Barra de pesquisa

Botão "Entrar"

Botão "Criar conta"

Banner principal com um vídeo/conteúdo em destaque

Seção "Em destaque"

Seção "Mais assistidos"

Seção "Novos episódios"

Seção "Desenhos"

Seção "Memes IA"

Seção "Séries"

Seção "Conteúdos Premium"

Cada conteúdo deve apresentar:

Capa/thumbnail

Título

Número de episódios

Categoria

Indicação "Grátis" ou "Premium"

Botão "Assistir"

2. SISTEMA DE CONTA

Permitir que o utilizador:

Criar uma conta

Fazer login

Recuperar palavra-passe

Editar perfil

Ver histórico de vídeos assistidos

Continuar assistindo de onde parou

Adicionar vídeos aos favoritos

Ver os conteúdos desbloqueados

Consultar o seu plano/pagamentos

Criar uma área "Minha Conta".

3. SISTEMA DE EPISÓDIOS

Os conteúdos devem ser organizados por séries/coleções.

Exemplo:

Série: "As Aventuras do Robô"

Temporada 1:

Episódio 1 — O início

Episódio 2 — O novo amigo

Episódio 3 — A missão secreta

Episódio 4 — A grande aventura

Episódio 5 — O confronto

Cada episódio deve possuir:

Thumbnail

Número do episódio

Título

Descrição

Duração

Vídeo

Estado: Gratuito ou Premium

Botão "Assistir"

4. SISTEMA DE BLOQUEIO PREMIUM

O administrador deve conseguir escolher quais episódios são gratuitos e quais são pagos.

Exemplo:

Episódio 1 — GRÁTIS
Episódio 2 — GRÁTIS
Episódio 3 — 🔒 PREMIUM
Episódio 4 — 🔒 PREMIUM

Quando o utilizador tentar assistir a um episódio bloqueado, mostrar uma tela/modal:

"Este episódio é exclusivo para membros."

"Desbloqueie este conteúdo para continuar assistindo."

Mostrar:

Preço

Benefícios

Botão "Desbloquear episódio"

Formas de pagamento disponíveis

Depois que o pagamento for confirmado, o episódio deve ficar disponível para aquele utilizador.

5. SISTEMA DE PAGAMENTOS

Criar uma estrutura preparada para pagamentos online.

O administrador deve poder configurar:

Preço de cada episódio

Preço de uma temporada

Preço de um pacote

Plano mensal

Plano anual

Também permitir que o administrador escolha se determinado conteúdo será:

Gratuito

Pago individualmente

Disponível apenas para assinantes

Criar sistema de confirmação de pagamento e registro das compras do utilizador.

6. PLAYER DE VÍDEO

Criar um player moderno com:

Play/Pause

Volume

Barra de progresso

Tela cheia

Controle de velocidade

Legendas, quando disponíveis

Próximo episódio

Episódio anterior

Guardar automaticamente o progresso do utilizador.

Se o utilizador sair no minuto 08:35, quando voltar ao vídeo deve aparecer:

"Continuar assistindo — 08:35"

7. PÁGINA DO CONTEÚDO

Ao clicar em uma série/desenho, abrir uma página com:

Capa

Título

Descrição

Categoria

Informações

Número de temporadas

Lista de episódios

Episódios gratuitos

Episódios premium

Botão "Continuar assistindo"

Criar uma experiência semelhante a plataformas modernas de streaming.

8. PAINEL ADMINISTRATIVO

Criar um painel administrativo completo.

O administrador deve conseguir:

Gerenciar vídeos

Adicionar vídeo

Editar vídeo

Excluir vídeo

Alterar thumbnail

Adicionar título

Adicionar descrição

Definir categoria

Definir duração

Adicionar vídeo

Publicar/despublicar

Gerenciar episódios

Criar temporada

Criar episódio

Alterar ordem dos episódios

Marcar como gratuito

Marcar como premium

Definir preço

Bloquear/desbloquear episódio

Gerenciar utilizadores

Ver utilizadores

Pesquisar utilizadores

Ver histórico de compras

Ver conteúdos desbloqueados

Bloquear/desbloquear utilizadores

Gerenciar pagamentos

Ver pagamentos

Pagamentos aprovados

Pagamentos pendentes

Pagamentos recusados

Valor total recebido

Histórico de transações

9. DASHBOARD DO ADMINISTRADOR

Criar um dashboard com estatísticas:

Total de utilizadores

Total de vídeos

Total de episódios

Total de episódios premium

Visualizações

Utilizadores ativos

Compras

Receita

Conteúdos mais assistidos

Utilizar gráficos modernos e profissionais.

10. SISTEMA DE CATEGORIAS

Criar categorias como:

🎬 Desenhos

😂 Memes

🤖 Memes IA

🎭 Séries

👨‍👩‍👧 Infantil

🔥 Tendências

⭐ Premium

🆕 Novidades

O administrador deve conseguir criar, editar e excluir categorias.

11. PESQUISA

Criar pesquisa global.

O utilizador deve conseguir pesquisar por:

Nome do vídeo

Nome da série

Episódio

Categoria

Mostrar resultados instantaneamente e permitir filtros.

12. DESIGN

O design deve ser:

Moderno

Premium

Responsivo

Mobile-first

Rápido

Fácil de navegar

Visualmente semelhante a plataformas profissionais de streaming

Utilizar cards grandes para os vídeos, banners de destaque, carrosséis horizontais e uma interface agradável.

Criar modo escuro como padrão.

13. TECNOLOGIA

Utilizar uma arquitetura moderna e escalável.

Frontend:

React ou Next.js

TypeScript

Tailwind CSS

Backend:

API segura

Banco de dados relacional

Sistema de autenticação

Criar uma estrutura preparada para armazenamento e streaming de vídeos.

Não armazenar vídeos diretamente no banco de dados. Utilizar armazenamento adequado para arquivos de vídeo e entregar os vídeos através de URLs seguras.

14. SEGURANÇA

Implementar:

Autenticação segura

Proteção das rotas administrativas

Controle de permissões

Proteção dos conteúdos premium

URLs de vídeo protegidas/temporárias quando possível

Validação dos pagamentos no servidor

Nunca liberar um episódio premium apenas porque o frontend recebeu uma variável indicando pagamento

Registar todas as compras e desbloqueios no banco de dados

15. EXPERIÊNCIA DO UTILIZADOR

Quando um utilizador estiver assistindo uma série, mostrar automaticamente:

"Próximo episódio"

Ao terminar um episódio gratuito, apresentar o próximo episódio.

Se o próximo episódio for premium:

"Você terminou o episódio 2."

"Desbloqueie o episódio 3 para continuar."

Botão:
"Desbloquear agora"

16. MODELO DE NEGÓCIO

A plataforma deve permitir três tipos de monetização:

Episódio individual

Temporada completa

Assinatura mensal/anual

O administrador deve poder ativar ou desativar cada modelo.

17. BANCO DE DADOS

Criar tabelas/coleções para:

users

profiles

videos

series

seasons

episodes

categories

purchases

subscriptions

watch_history

favorites

payments

admin_users

Criar os relacionamentos corretamente.

18. IMPORTANTE

O projeto deve ser desenvolvido como uma plataforma real e funcional, não apenas como um protótipo visual.

Criar:

Frontend funcional

Backend funcional

Banco de dados

Autenticação

Painel administrativo

Sistema de episódios

Sistema de bloqueio premium

Sistema de pagamentos preparado para integração

Histórico de visualização

Favoritos

Pesquisa

Responsividade para computador, tablet e telemóvel

Utilizar dados de demonstração inicialmente para que seja possível visualizar a plataforma funcionando.

Criar também alguns conteúdos fictícios de exemplo, como:

"Memes do Futuro — Temporada 1"

"Os Robôs Malucos — Temporada 1"

"As Aventuras de Zito — Temporada 1"

"Memes IA Moçambique"

Não utilizar conteúdos protegidos por direitos autorais sem autorização. A plataforma deve ser preparada para conteúdos próprios ou devidamente licenciados.

O resultado final deve parecer uma verdadeira plataforma de streaming profissional, com possibilidade de crescimento para milhares de utilizadores e centenas de séries e episódios.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cartoon-cove.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e9950a70-b014-4d1c-a6c3-7430b5fbfb9a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
