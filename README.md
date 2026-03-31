<h1>Sistema de Reserva e Rastreamento de Equipamento</h1>

<h2>Escopo</h2>

<p>A proposta consiste em realizar o desenvolvimento de um sistema para rastreamento e reserva de equipamentos dentro da empresa. Após análise do cenário atual, foi identificado que o setor de hardware enfrenta dificuldades para localizar equipamentos e controlar sua utilização, como teclados, cabos e demais periféricos. Além disso, foi observado que os demais funcionários também enfrentam dificuldades para saber os equipamentos disponíveis ou em uso.</p>

<b><p>Objetivos do sistema</p></b>

<ul><li>Identificar quem está utilizando cada equipamento</li>
<li>Por quanto tempo ele está reservado</li>
<li>Facilitar a busca através de filtros de pequisa</li></ul>

<hr>
<h2>CDU001 – Registro de Usuário</h2>
<p>Permite que novos usuários realizem cadastro no sistema.</p>
<b><p>Campos:</p></b>
<ul><li>Nome</li>
<li>E-mail</li>
<li>Senha</li>
<li>Setor</li></ul>

<hr>
<h2>CDU002 – Login de Usuário</h2>
<p>Permite que os usuários realizem login no sistema.</p>
<b><p>Campos:</p></b>
<ul><li>E-mail</li>
<li>Senha</li></ul>

<p>Após a autenticação, o sistema verifica o tipo de usuário, caso o usuário seja do tipo administrador, será direcionado para a <b>tela administrativa</b>, Caso seja um usuário comum, será direcionado para a <b>tela principal de equipamentos.</b></p>

<hr>
<h2>CDU003 – Visualização de Equipamentos (Usuário)</h2>
<p>O sistema contará com uma tela de visualização contendo todos os equipamentos cadastrados no banco.</p>
  
<p>Nesta tela, o usuário poderá <b>visualizar suas reservar, pesquisar equipamentos e acessar histórico dos equipamentos.</b></p>
<b><p>Informações exibidas na tabela:</p></b>
<ul><li>Código do equipamento</li>
<li>Nome do equipamento</li>
<li>Usuário que reservou recentemente</li>
<li>Data Inicial da reserva</li>
<li>Data Final da reserva</li>
<li>Status (Reservado, Disponível, Manutenção, Inativo)</li></ul>

<b><p>Ações Disponíveis:</p></b>


