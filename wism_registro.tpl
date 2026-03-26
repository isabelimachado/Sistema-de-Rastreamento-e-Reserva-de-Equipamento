<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema De Reserva e Rastreamento de Hardware - Registro</title>

    <link rel="stylesheet" href="/sistema/jquery/jquery.modal.min.css">
    <link rel="stylesheet" href="/sistema/templates/webstyle.css">
    <script src="/sistema/jquery/webfuncs.js"></script>

    <script src="/sistema/jquery/jquery.min.js"></script>
    <script src="/sistema/jquery/jquery.modal.min.js"></script>

    <!-- BEGIN BLOCK_CACHE_REGISTRO -->
    <link rel="stylesheet" href="/sistema/templates/wism_projeto.css?vcache=[cache]">
    <script src="/sistema/templates/wism_projetorg.js?vcache=[cache]"></script>
    <!-- END BLOCK_CACHE_REGISTRO -->
</head>

<body>
<div id="login">
    <h1 class="titulo">Sistema de Reserva e Rastreamento de Hardware Agrosys</h1>

    <h2>Login</h2>
    <div id="inputeselect">
        <input type="text" placeholder="E-mail" id="emailLogin" name="emailLogin">
        <input type="password" placeholder="Senha" id="senhaLogin" name="senha">
    </div>
    <button id="fazerLogin">Login</button>
    <a href="#" id="IrTelaRegistra"><span>Não possui uma conta? Crie uma conta!</span></a>
</div>

<div id="registro">
    <h1 class="titulo">Sistema de Reserva e Rastreamento de Hardware Agrosys</h1>

    <h2>Registro</h2>
    <div id="inputeselect">
        <input type="text" placeholder="E-mail" id="emailRegistro" name="email">
        <input type="text" placeholder="Nome" id="nome" name="nome">
        <select id="setor" name="setor">
            <option value=""disabled selected>Setores</option>
            <option value="Projetos">Projetos</option>
            <option value="Tecnologia">Tecnologia</option>
            <option value="Iimplantação">Implantação</option>
            <option value="Produção de Aves">Produção de Aves</option>
            <option value="Suprimentos">Suprimentos</option>
            <option value="Comercial">Comercial</option>
            <option value="Industrial">Industrial</option>
            <option value="Fábrica de Ração">Fábrica de Ração</option>
            <option value="Finanças">Finanças</option>
            <option value="Departamento Fiscal">Departamento Fiscal</option>
            <option value="Atendimento n1">Atendimento N1</option>
            <option value="Atendimento n2">Atendimento N2</option>
        </select>
        <input type="password" placeholder="Senha" id="senhaRegistro" name="senha">
    </div><br>
    <button id="fazerCadastro">Registrar</button>
    <a href="#" id="IrTelaLogin"><span>Já possui uma conta? Acesse a sua conta!</span></a>
</div>

</body>

</html>