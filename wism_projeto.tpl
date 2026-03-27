<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema De Reserva e Rastreamento de Equipamento - Registro</title>

    <link rel="stylesheet" href="/sistema/jquery/jquery.modal.min.css">
    <link rel="stylesheet" href="/sistema/templates/webstyle.css">

    <script src="/sistema/jquery/jquery.min.js"></script>
    <script src="/sistema/jquery/jquery.modal.min.js"></script>

    <script src="/sistema/jquery/plugins/snackbar/snackbar.min.js"></script>
    <link rel="stylesheet" href="/sistema/jquery/plugins/snackbar/snackbar.min.css">

    <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=power_settings_new" />

    <!-- BEGIN BLOCK_CACHE -->
    <link rel="stylesheet" href="/sistema/templates/wism_projeto.css?vcache=[cache]">
    <script src="/sistema/templates/wism_projeto.js?vcache=[cache]"></script>
    <!-- END BLOCK_CACHE -->
</head>

<body>
    <!--!------------------- TELA PRINCIPAL --------------------->

    <div class="fundo">
        <header>
            <h3 class="tituloprinci">Sistema De Reserva e Rastreamento de Equipamento</h3>
        </header>

        <div class="pesquisas">
            <select id="selectusu">
                <option>Código</option>
                <option>Tipo</option>
                <option>Nome</option>
                <option>Status</option>
            </select>

            <input id="vpad-pesqusu" type="text">

            <div class="datas">
                <label for="datai">Data Inicial</label>
                <input id="datai" type="date">
            </div>

            <div class="datas">
                <label for="dataf">Data Final</label>
                <input id="dataf" type="date">
            </div>

            <a href="javascript:void(0)" class="logout">
                <span class="material-symbols-outlined">
                    power_settings_new
                </span>
            </a>
        </div>
        <hr>
        <div class="scroll">
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th style="text-align: center;">Código</th>
                        <th>Equipamento</th>
                        <th>Tipo</th>
                        <th>Usuário</th>
                        <th>Data Início</th>
                        <th>Data Final</th>
                        <th style="text-align: center;">Motivo</th>
                        <th style="text-align: center;">Status</th>
                    </tr>
                </thead>

                <tbody>
                    <!-- BEGIN BLOCK_EQUIPA -->
                    <tr>
                        <td style="width:20px;"><input type="radio" name="equipamentos"></td>
                        <td style="text-align: center;">[vcod]</td>
                        <td>[vnome]</td>
                        <td>[vtipo]</td>
                        <td>[vusu]</td>
                        <td>[vdata_inicio]</td>
                        <td>[vdata_final]</td>
                        <td>[vmotivo]</td>
                        <td style="text-align: center;">[vstatus]</td>
                    </tr>
                    <!-- END BLOCK_EQUIPA -->
                </tbody>
            </table>
        </div>

        <div class="botoes">
            <button class="botaoHistorico">Histórico</button>
            <button id="botaoReservas">Minhas Reservas</button>
            <button id="botaoCriarReserva">Criar Reserva</button>
        </div>
    </div>

    <!--!------------------- MINHAS RESERVAS --------------------->
    <div id="minhasReservas" class="modal">
        <h3 class="tituloModal">Minhas Reservas</h3>

        <div id="listaMinhasReservas">
            <div class="linhaMinhasReservas cabecalho">
                <div class="coluna"><b>Equipamento</b></div>
                <div class="coluna"><b>Data Início</b></div>
                <div class="coluna"><b>Data Final</b></div>
                <div class="coluna"><b>Ações</b></div>
            </div>
        </div>
    </div>

    <!--!------------------- CRIAR RESERVA --------------------->

    <div id="criarReserva" class="modal">

        <h3 class="tituloModal">Criar Reserva</h3>
        <div class="listaCriar">
            <p>Equipamento</p>
            <select class="selectEquipa">
                <option value="" disabled selected><-- SELECIONE --></option>
                <!-- BEGIN BLOCK_SELECT_EQUIPA -->
                <option value="[vcodigo]">[vnome]</option>
                <!-- END BLOCK_SELECT_EQUIPA -->
            </select>
            <p>Data Inicio</p>
            <input id="dataInicio" type="date">
            <p>Data Final</p>
            <input id="dataFinal" type="date">
            <p>Motivo</p>
            <input id="motivo" type="text" placeholder="Motivo">
            <a href="#" id="mostrarHistorico" style="text-align: center;"><p>Clique para acessar o histórico do equipamento selecionado!</p></a>
        </div>
        <button id="botaoConfirmar">Confirmar</button>
    </div>

    <div id="historicoselect" class="modal">
        <iframe id="iframeGraficoSelect"></iframe>
    </div>

    <!--!------------------- CADASTRO/INCLUIR EQUIPAMENTO ADM --------------------->
    <div id="cadastroEquipamento" class="modal">

        <h3 class="tituloModal">Incluir Equipamento</h3>
        <div id="listaCriarEquipa">
            <p>Nome</p>
            <input id="nomeEquipa" type="text" placeholder="Nome">
            <p>Tipo</p>
            <select id="tipoEquipa">
                <option value="" disabled selected><-- SELECIONE --></option>
                <!-- BEGIN BLOCK_SELECT_TIPO -->
                <option value="[vcodigotipo]">[vnometipo]</option>
                <!-- END BLOCK_SELECT_TIPO -->
            </select>
        </div>

        <button id="botaoConfirmarEquipa">Confirmar</button>
    </div>


    <!--!------------------- ALTERAR STATUS --------------------->
    <div id="alterarStatus" class="modal">

        <h3 class="tituloModal">Alterar Status</h3>

        <!--inativo      ? nunca mais será usado 
            manutencao   ? sendo consertado 
            disponivel   ? pode reservar 
        -->
        <div id="detalhes">
            <h4>Informações Principais</h4>
            <h5>Equipamento: <span id="EquipaNome"></span></h5>
            <h5>Status atual: <span id="statusEquipa"></span></h5>
        </div>

        <select id="selectStatus">
            <option value="Disponível">Disponível</option>
            <option value="Manutenção">Manutenção</option>
            <option value="Inativo">Inativo</option>
        </select>

        <button id="botaoConfirmarSt">Confirmar</button>
    </div>

    <!--!------------------- HISTÓRICO USU E ADM--------------------->
    <div id="historico" class="modal">
        <div class="cabecalhoModal">
            <h3 class="tituloModal">Histórico de Reservas</h3>
        </div>

        <br>
        <iframe id="iframeGrafico" style="height:400px; width:100%; border:none;"></iframe>
    </div>

    <div id="padrao" style="display: none;">
        <button class="sair">Sair</button>
        <iframe id="padraoIframe" style="height:45.5rem; width: 100%; margin-bottom: 30rem;"></iframe>
    </div>
    <!--!------------------- TELA ADM --------------------->
    <div id="adm">
        <div class="fundo2">
            <header>
                <h3 class="tituloprinci">Sistema De Reserva e Rastreamento de Equipamento - ADM</h3>
            </header>

            <div class="pesquisas">
                <select id="selectadm">
                    <option>Código</option>
                    <option>Tipo</option>
                    <option>Nome</option>
                    <option>Status</option>
                </select>

                <input id="vpad-pesqadm" type="text">

                <div class="datas">
                    <label for="datai">Data Inicial</label>
                    <input class="datai" type="date">
                </div>

                <div class="datas">
                    <label for="dataf">Data Final</label>
                    <input class="dataf" type="date">
                </div>

                <a href="javascript:void(0)" class="logout">
                    <span class="material-symbols-outlined">
                        power_settings_new
                    </span>
                </a>
            </div>

            <hr>

            <div class="scroll">
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th style="text-align: center;">Código</th>
                            <th>Equipamento</th>
                            <th>Tipo</th>
                            <th>Usuário</th>
                            <th>Data Início</th>
                            <th>Data Final</th>
                            <th style="text-align: center;">Motivo</th>
                            <th style="text-align: center;">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        <!-- BEGIN BLOCK_ADM -->
                        <tr>
                            <td style="width:20px;"><input type="radio" name="equipamentosADM"></td>
                            <td style="text-align: center;">[vcod]</td>
                            <td>[vnome]</td>
                            <td>[vtipo]</td>
                            <td>[vusu]</td>
                            <td>[vdata_inicio]</td>
                            <td>[vdata_final]</td>
                            <td>[vmotivo]</td>
                            <td style="text-align: center;">[vstatus]</td>
                        </tr>
                        <!-- END BLOCK_ADM -->
                    </tbody>
                </table>
            </div>

            <div class="botoes">
                <button class="botaoHistorico">Histórico</button>
                <button id="botaoAdicionar" style="width: 10.5rem;">Incluir Equipamento</button>
                <button id="botaoAlterar">Alterar Status</button>
                <button id="botaoReservasADM">Minhas Reservas</button>
                <button id="botaoCadastroTipo">Incluir Tipo</button>
                <button id="botaoCriarReservaADM">Criar Reserva</button>
            </div>
        </div>
    </div>

</body>

</html>
