$(document).ready(function () {
    //!-------------------VALIDACOES USUÁRIO-------------------
    //resumo: pega código do usuario cadastrado no navegador,cria uma variavel q retorna um json q vira um object com as info do usuario, dps atribui o codigo do navegador para ele, e verifica senao tiver usuario as telas principais ficam fechadas
    //?-POR QUE USEI SESSION STORAGE EM VEZ DE LOCAL STORAGE?-:
    //? com local, o login/registro ficava o msm para todo mundo que entrava no meu projeto no erp, talvez por causa do perfil que entra no erp é o msm então seria msm sessão, com session os dados são temporarios 
    window.vCodUsuarioLogado = sessionStorage.getItem("vCodUsuarioLogado");

    let usuario = JSON.parse(sessionStorage.getItem("usuario"));
    window.vCodUsuarioLogado = usuario.codigo;

    if (!usuario) {
        $(".fundo").hide();
        $("#adm").hide();
        return;
    }
    if (usuario.tipo === "ADM") {
        $("#adm").show();
        $(".fundo").hide();
    }
    else {
        $(".fundo").show();
        $("#adm").hide();
    }

    //!-------------------FUNCTIONS-------------------
    //resumo: pega linhas visiveis da tabela, percorre cada uma e faz uma fica de uma cor, depois a outra fica a oposta, logica de par simples
    function Zebra() {
        let linhas = $("table tbody tr:visible");
        linhas.each(function (index) {
            let cor = (index % 2 === 0) ? "#e1f0fd" : "#ffffff";
            $(this).find("td").css("background", cor);
        });
    }

    //resumo: função que pega datas em um array, pega e divide cada parte com - separado, tanto para data final ou data inicial
    function formatarDataProgress(hifen, prefixo) {
        let partes = hifen.split("-");
        return {
            [`${prefixo}_mes`]: partes[1],
            [`${prefixo}_dia`]: partes[2],
            [`${prefixo}_ano`]: partes[0]
        };
    }
    //resumo : função para pegar primeiro tr visivel, tira o checked e a class, e dps adiciona para o primeiro, em caso de mudanças, ex: o primeiro era o 2 tr mas depois foi a 1  
    function radioPrimeiraLinha() {
        let primeira = $("table tbody tr:visible").first();
        $("input[type='radio']").prop("checked", false);
        $("tbody tr").removeClass("linha-selecionada");
        primeira.find("input[type='radio']").prop("checked", true);
        primeira.addClass("linha-selecionada");
    }

    //resumo: sobe ate a tabela e remove a class linha-selecionada de toda, so coloca no radio selecionado,ai fica bom as bordas em volta
    function selecionarLinha(radio) {
        $(radio).closest("table").find("tbody tr").removeClass("linha-selecionada");
        $(radio).closest("tr").addClass("linha-selecionada");
    }
    //resumo: faz uma requisição pra envia pro progress, envia a procedure e o codigo do usuario logado,depois recebe o código do p e remove linhas antigas, menos o cabeçalho, se nao tiver nada pra colocar, mostra q não tem reservas,senao adiciona as reservas, e abre o modal
    function abrirMinhasReservas() {
        $.get("", {
            vpad_proc: "p_minhas_reservas",
            vcodigo_usu: window.vCodUsuarioLogado
        }, function (html) {
            $("#listaMinhasReservas .linhaMinhasReservas:not(.cabecalho)").remove();
            $("#listaMinhasReservas .semReservas").remove();

            if ($.trim(html) === "") {
                $("#listaMinhasReservas").append('<div class="semReservas">Nenhuma reserva encontrada.</div>');
            }
            else {
                $("#listaMinhasReservas .cabecalho").after(html);
            }

            $("#minhasReservas").modal();
        });
    }
    //resumo: função so para realizar uma ação uma vez quando clica várias vezes num botão :)
    function botaoUmaVez(botao) {
        if (botao.prop("disabled")) return false;
        botao.prop("disabled", true);
        return true;
    }
    //resumo: pega o tipo da coluna pelo select, cria um let para o tbody da tabela, pega valores do input, apos isso, encontra todas as tr, se for nome, vai achar as td de nome que é a segundam segue essa logica, ate o código que a logica vira matematica, isso acontece pelo sort() que faz comparação de dois itens, dps de tudo so adiciona na tbody que for pega a primeira tr mostrada e adiciona a class e checked
    function ordernarSelect(select, inputPesquisa, tabela) {
        let tipo = $(select).val();
        let tbody = $(tabela + " table tbody");

        $(inputPesquisa).val("");

        tbody.find("tr").sort((a, b) => {

            let valA, valB;

            if (tipo === "Nome") {
                valA = $(a).find("td:eq(2)").text();
                valB = $(b).find("td:eq(2)").text();
            }
            else if (tipo === "Status") {
                valA = $(a).find("td:last").text();
                valB = $(b).find("td:last").text();
            }
            else if (tipo === "Tipo") {
                valA = $(a).find("td:eq(3)").text();
                valB = $(b).find("td:eq(3)").text();
            }
            else {
                valA = parseInt($(a).find("td:eq(1)").text());
                valB = parseInt($(b).find("td:eq(1)").text());
                return valA - valB;
            }
            //se o numero que resultar de a-b for negativo a vai antes, se for positivo vai na frente ex: 1-2 da -1 ent 1 vem antes de 2
            return valA.toLowerCase().localeCompare(valB.toLowerCase());
            //localcompare->metódo que ignora tamanho de palavras ou acentuação, junto com o sort() ele so compara se tal palavra pela inciail é maior q a outra
        }).appendTo(tbody);
        radioPrimeiraLinha();
        Zebra();
    }
    //resumo: snackbar com cores para cada tipo de mensagem, atirbuir o texto para ele,centralizar,adicionar cor botao e afins, alem da class tambem
    function mostrarSnack(texto, tipo = "info") {
        let cor = "#2196F3";

        if (tipo === "erro") cor = "#e74c3c";
        if (tipo === "sucesso") cor = "#2ecc71";

        Snackbar.show({
            text: texto,
            backgroundColor: cor,
            pos: "top-center",
            duration: 2000,
            actionText: "OK",
            onActionClick: (element) => element.style.opacity = 0,
            customClass: "snack-container",
            actionTextColor: "#ffffff",
        });
    }
    //resumo: função para facilitar na hora q recebe o json do progress para transformar em object para mensgaem - retira qualquer ? do json
    function objectJSON(resp) {
        try {
            let limpo = resp.replace(/\?/g, "");
            return JSON.parse(limpo.trim());
        }
        catch {
            return { msg: false };
        }
    }

    //!-------------------HISTORICO SELECT-------------------
    //resumo: verifica se selecionou algum equipamento, se sim abre o modal q tem o iframe com o histórico filtrado pelo cóidgo do equipa
    $("#mostrarHistorico").click(function () {
        let codigo = $(".selectEquipa").val();
        if (!codigo) {
            mostrarSnack("Selecione um equipamento!");
            return;
        }
        $("#historicoselect").modal();
        document.getElementById("iframeGraficoSelect").src =
            "/webpro/weball/wism_grafico?vcodigo_equipa=" + codigo;
    });
    //resumo: abrir histórico sem filtro nenhum
    $(".botaoHistorico").click(function () {
        $("#historico").modal();
        document.getElementById("iframeGrafico").src = "/webpro/weball/wism_grafico";
    });

    //!-------------------ABRIR MANUTENÇÃO TIPO-------------------
    //resumo: abrir tela que contém o iframe com o padrão de manutenção
    $("#botaoCadastroTipo").click(function () {
        $("#padrao").show();
        $("#adm").hide();
        document.getElementById("padraoIframe").src = "/webpro/weball/wism_tiposm";
    });

    //!-------------------ALTERAR DATAS MINHAS RESERVAS-------------------
    //resumo: document pq se fosse so click pelo jquery dava erro por ser elemento criado dinamicamente, pega a linha que está o botão de alterar, pega da linha na coluna de data inicio e data final, transforma onde está as datas para um input date com valor as datas formatadas para o progress conseguir ler, cria um botão de confirmar onde estava o de alterar, agora onde estava o botão de cancelar reserva antiga pega as mesma propriedades e transforma em um irmão/clone para reutilizar class e td so q tira o antigo
    $(document).on("click", ".botaoAlterar", function () {
        let linha = $(this).closest(".linhaMinhasReservas");
        let dataInicio = linha.find(".coluna").eq(1).text().trim();
        let dataFinal = linha.find(".coluna").eq(2).text().trim();

        function converterParaInput(data) {
            let partes = data.split("/");
            return partes[2] + "-" + partes[1] + "-" + partes[0];
        }

        let dataFinalFormatada = converterParaInput(dataFinal);
        let dataInicioFormatada = converterParaInput(dataInicio);

        linha.find(".coluna").eq(1).html(`<input type="date" class="inputDataInicio" value="${dataInicioFormatada}">`);
        linha.find(".coluna").eq(2).html(`<input type="date" class="inputDataFinal" value="${dataFinalFormatada}">`);

        $(this).text("Confirmar").addClass("botaoConfirmarAlt").removeClass("botaoAlterar");
        let botaoCancelar = $(this).siblings(".botaoCancelar");

        let botaoCancelarClone = botaoCancelar.clone();
        botaoCancelarClone.text("Cancelar").addClass("botaoCancelarAlt").removeClass("botaoCancelar");
        $(this).after(botaoCancelarClone);
        botaoCancelar.hide();
    });

    //!-------------------CONFIRMAR ALTERAÇÃO DE DATAS-------------------
    //resumo: depois que clica no botão de confirmar alteração, pega a linha do alterar, id do botão para saber qual é a reserva, abre a requisição, fala a proceure, especifica o id, separa o dia,mes e ano para o formato do progress (mm/dd/aaaa) com -, dps valida a resposta que o progress manda
    $(document).on("click", ".botaoConfirmarAlt", function () {
        let botao = $(this);
        if (!botaoUmaVez(botao)) return;
        let linha = $(this).closest(".linhaMinhasReservas");
        let id = $(this).data("id");

        let dataInicio = linha.find(".inputDataInicio").val();
        let dataFinal = linha.find(".inputDataFinal").val();

        $.get("", {
            vpad_proc: "p_alterar_reserva",
            vcodigo_reserva: id,
            ...formatarDataProgress(dataInicio, "di"),
            ...formatarDataProgress(dataFinal, "df"),
        }, function (resp) {
            let res = objectJSON(resp);

            if (res.msg === "data inicial menor que hoje") {
                mostrarSnack("Data de início não pode ser no passado!");
                botao.prop("disabled", false);
                return;
            }

            else if (res.msg === "data final menor que a incial") {
                mostrarSnack("Data final deve ser posterior à inicial!");
                botao.prop("disabled", false);
                return;
            }

            else if (res.msg === "datas iguais") {
                mostrarSnack("As datas são iguais à reserva atual!");
                botao.prop("disabled", false);
                return;
            }

            else if (res.msg == "conflito datas") {
                mostrarSnack("Esta data conflita com outra reserva no mesmo período!")
                botao.prop("disabled", false);
                return;
            }

            else if (res.msg === true) {
                mostrarSnack("Reserva alterada com sucesso!", "sucesso");
                location.reload();
            }

            else {
                mostrarSnack("Erro ao alterar reserva!", "erro");
                botao.prop("disabled", false);
            }
        });
    });

    //!-------------------CANCELAR EDIÇÃO DE DATAS-------------------
    //resumo: quando clica em cancelar no modo de alteração volta pra como tava antes as reservas
    $(document).on("click", ".botaoCancelarAlt", function () {
        abrirMinhasReservas();
    });

    //!-------------------CANCELAR RESERVA-------------------
    //resumo: pega data id do botão pega a linha faz um confirm se quiser cancelar, se nao quiser para, senão faz a requisição com a procedure e o id, se der certo, tira a linha antiga , dps pega o tamanho da lista de reservas q tiver se a quantidade for menor que 1 adiciona uma div dizendo q ta sem reselva, recarrega a pag 
    $(document).on("click", ".botaoCancelar", function () {
        let id = $(this).data("id");
        let linha = $(this).closest(".linhaMinhasReservas");

        if (!confirm("Deseja cancelar a reserva?")) return;

        $.get("", {
            vpad_proc: "p_cancelar_reserva",
            vcodigo_reserva: id
        }, function (resp) {

            let res = objectJSON(resp);

            if (res.msg === true) {
                linha.remove();

                let linhasRestantes = $("#listaMinhasReservas .linhaMinhasReservas").length;
                if (linhasRestantes <= 1) {
                    $("#listaMinhasReservas").append('<div class="semReservas">Nenhuma reserva encontrada.</div>');
                }

                Zebra();
                mostrarSnack("Reserva cancelada com sucesso!", "sucesso");
                location.reload();
            }
            else {
                mostrarSnack("Erro ao cancelar reserva!", "erro");
            }
        })
    });

    //!-------------------INCLUIR EQUIPAMENTO MODAL-------------------
    //resumo: abre o modal de cadastro.
    $("#botaoAdicionar").click(function () {
        $("#nomeEquipa").val("");
        $("#cadastroEquipamento").modal();
    });

    //!-------------------CONFIRMAR INCLUIR EQUIPAMENTO-------------------
    //resumo: pega o valor do input e do select, verifica se ta tudo
    $("#botaoConfirmarEquipa").click(function () {
        let botao = $(this);
        if (!botaoUmaVez(botao)) return;
        let nome = $("#nomeEquipa").val().trim();
        let tipo = $("#tipoEquipa").val();

        if (!nome || !tipo) {
            mostrarSnack("Preencha todos os campos!");
            botao.prop("disabled", false);
            return;
        }

        $.get("", {
            vpad_proc: "p_incluir_equipamento",
            vnome: agroEscape(nome),
            vtipo: tipo
        }, function (resp) {
            let res = objectJSON(resp);

            if (res.msg === true) {
                mostrarSnack("Equipamento incluído com sucesso!", "sucesso");
                location.reload();
            }

            else {
                mostrarSnack("Erro ao incluir equipamento!", "erro");
                botao.prop("disabled", false);
            }
        });
    });

    //!-------------------ALTERAR EQUIPAMENTO MODAL-------------------
    //pega o radio selecionado, pega o nome e o status do radio selecionado, atribui para o span que mostra os detalhes, e dentro do select o valor vai ser o status atual, se o status atual na tabela for reservado, não vai dar mudar, abre modal
    $("#botaoAlterar").click(function () {
        let selecionado = $("input[name='equipamentosADM']:checked");
        let nome = selecionado.closest("tr").find("td:eq(2)").text();
        let statusAtual = selecionado.closest("tr").find("td:last").text().trim();

        $("#statusEquipa").text(statusAtual);
        $("#EquipaNome").text(nome);

        if (statusAtual.toLowerCase() == "reservado") {
            mostrarSnack("Não tem como alterar status, porque está reservado!", "erro")
            return;
        }

        $("#alterarStatus").modal();
    });

    //!-------------------CONFIRMAR ALTERAR EQUIPAMENTO-------------------
    //resumo: pega codigo do selecionado,status e o status do select, se for igual ambos, não vai salvar, senao envia tudo pro progress código e novo status e altera 
    $("#botaoConfirmarSt").click(function () {
        let botao = $(this);
        if (!botaoUmaVez(botao)) return;
        let selecionado = $("input[name='equipamentosADM']:checked");
        let codigo = selecionado.closest("tr").find("td:eq(1)").text().trim();
        let novoStatus = $("#selectStatus").val().trim();
        let statusAtual = selecionado.closest("tr").find("td:last").text().trim();

        if (statusAtual === novoStatus) {
            mostrarSnack("Não tem como mudar para este status, porque já está " + statusAtual.toLowerCase())
            botao.prop("disabled", false);
            return;
        }

        $.get("", {
            vpad_proc: "p_alterar_status",
            vcodigo_equipa: codigo,
            vstatus: agroEscape(novoStatus)
        }, function (resp) {
            let res = objectJSON(resp);

            if (res.msg === "futuras reservas") {
                mostrarSnack("Tem futuras reservadas, não tem como alterar o status");
                botao.prop("disabled", false);
                return;
            }

            else if (res.msg === true) {
                Zebra();
                mostrarSnack("Status alterado com sucesso!", "sucesso");
                location.reload();
            }

            else {
                mostrarSnack("Erro ao alterar status!", "erro");
                botao.prop("disabled", false);
            }
        });
    });

    //!-------------------CONFIRMAR CRIAR RESERVA-------------------
    //resumo: pega data inicio,data final, valor do select que é o código de cada equipamento, formata novamente as datas , evia como requisição e faz as validações, por ex: de cria reserva para um equipamento que já esta reservado naquele período
    $("#botaoConfirmar").click(function () {
        let botao = $(this);
        if (!botaoUmaVez(botao)) return;
        let dataInicio = $("#dataInicio").val();
        let dataFinal = $("#dataFinal").val();
        let codigoEquipa = $(".selectEquipa").val();
        let motivo = $("#motivo").val().trim();

        $.get("", {
            vpad_proc: "p_criar_reserva",
            vcodigo_equipa: codigoEquipa,
            vcodigo_usu: window.vCodUsuarioLogado,
            ...formatarDataProgress(dataInicio, "di"),
            ...formatarDataProgress(dataFinal, "df"),
            motivo: agroEscape(motivo)
        }, function (resp) {
            let res = objectJSON(resp);

            if (res.msg === "mesmo periodo reserva") {
                mostrarSnack("Já possui uma reserva para este equipamento neste período!")
                botao.prop("disabled", false);
                return;
            }

            else if (res.msg === true) {
                mostrarSnack("Reserva criada com sucesso!", "sucesso");
                Zebra();
                location.reload();
            }

            else {
                mostrarSnack("Erro ao criar reserva!", "erro");
                botao.prop("disabled", false);
            }
        });
    });

    // !-------------------FILTRO DE DATAS-------------------
    //resumo: pega cada mudança dos input, pega o container mas proximo (fundo ou adm), pega os valores e inicia a funcao para converte data para o formato que aparece na table, depois aplica nos valores do input, pega cada linha do container percorre as mesma, flag pra ver se encontrou linha valida,pega as datas da colunas 6 e 5, mostrar condição para mostrar tabela ou não
    $(".datai, .dataf").on("change", function () {
        const container = $(this).closest(".fundo, #adm");
        const dataInicio = container.find(".datai").val();
        const dataFinal = container.find(".dataf").val();
        //se data esta vazia "", -- ou nem existe, ent retorna null, remove espaço
        const converterData = (str) => {
            if (!str || str.trim() === "" || str.includes("--")) return null;
            str = str.trim();
            let dia, mes, ano;
            //se o formato é aaaa-mm-dd, pega a data, tira os hifen, e coloca cada parte dentro de um array, msm lógica caso seja "/"
            if (str.includes("-")) {
                let partes = str.split("-");
                [ano, mes, dia] = partes;
            } else if (str.includes("/")) {
                let partes = str.split("/");
                [dia, mes, ano] = partes;
            } else {
                return null;
            }
            //se o tamanho do ano for dois caracteres, vai ser 20 + o ultimo dois digitos 2026, depois junta tudo do array ali e converte pra arraym ja no dia/mes faz padstart q garante q vai ser dois numeros e comeca com 0
            if (ano.length === 2)
                ano = "20" + ano;
            return parseInt(ano + mes.padStart(2, "0") + dia.padStart(2, "0"));
        };

        const fDataInicio = converterData(dataInicio);
        const fDataFinal = converterData(dataFinal);

        const linhas = container.find("table tbody tr");
        let encontrou = false;

        linhas.each(function () {
            const linhaAtual = $(this);
            const linhaDataI = converterData(linhaAtual.find("td:eq(5)").text());
            const linhaDataF = converterData(linhaAtual.find("td:eq(6)").text());

            let mostrar = true;

            if (!fDataInicio && !fDataFinal) { //senao tem data mostra tudo
                mostrar = true;
            } else {
                //se tiver data compara, a data inicial da tabela for menor que a data escrita, então nao mostra, a msm logica para data final se a data final da tabela for maior que a data escrita
                if (fDataInicio && linhaDataI < fDataInicio) {
                    mostrar = false;
                }
                if (fDataFinal && linhaDataF > fDataFinal) {
                    mostrar = false;
                }
                if (!linhaDataI || !linhaDataF) mostrar = false; //se tiver alguma data invalida não mostra
            }

            $(this).toggle(mostrar); //se mostrar true ent mostra, senao false
            if (mostrar) encontrou = true;
        });
        //se encontrou alguma linha mostra
        container.find("table").toggle(encontrou);
        Zebra();
        radioPrimeiraLinha();
    });

    //! ------------------- EVENTOS-------------------

    //! -------------------PESQUISA ADM E USU-------------------
    //resumo: sempre que alterar algo no input de adm ou usario, e der enter, id atual pega o id da tela q está , valor do input, e atribui pro select os id correspondente ao input, msm coisa pro radio , pega o valor do select q for, pega a linhas da tabela, e atribui no comeco a tabela como false, percorre as linhas da tabela, pega da campo q quer, faz uma variavel bool se for pra mostra na tabela, se nao tiver nada no input so mostra a tela normal, senao e se o tipo for codigo vai mostra so numero digitado e numeros maiores q ele, se for nome vai mostra td que tiver algo q foi digitado, já no tipo é exato, se mostrar for true mostra,  adicona a condicao da tabela, por ultimo é so atribuir a class para o radio que for e deixa ele selecionado
    $("#vpad-pesqusu, #vpad-pesqadm").on("keydown", function (e) {
        if (e.key !== "Enter") return;

        let idAtual = $(this).attr("id");
        let valor = $(this).val().trim().toLowerCase();

        let idSelect = (idAtual === "vpad-pesqusu") ? "#selectusu" : "#selectadm";

        let tipo = $(idSelect).val();
        let linhas = $("table tbody tr");
        let tabelaCondicao = false;

        linhas.each(function () {
            let codigo = $(this).find("td:eq(1)").text().trim();
            let nome = $(this).find("td:eq(2)").text().toLowerCase();
            let tipoEquipa = $(this).find("td:eq(3)").text().toLowerCase();
            let vstatus = $(this).find('td:eq(8)').text().toLowerCase();
            let mostrar;

            if (valor === "") {
                mostrar = true;
            } else {
                if (tipo === "Código") {
                    let numValor = Number(valor);
                    mostrar = (numValor === 0) ? true : Number(codigo) >= numValor;
                }
                else if (tipo === "Nome") {
                    mostrar = nome.includes(valor);
                }
                else if (tipo === "Tipo") {
                    mostrar = tipoEquipa.includes(valor);
                }
                else if (tipo === "Status") {
                    mostrar = (valor === vstatus);
                }
            }

            $(this).toggle(mostrar);
            if (mostrar) tabelaCondicao = true;
        });

        $("table").toggle(tabelaCondicao);
        Zebra();
        radioPrimeiraLinha();
    });

    //!-------------------CLASSE PARA RADIOS SELECIONADOS-------------------
    //resumo: adicionar um listener q ve cada mudanca do radio e se for algum radio selecionado realiza a função e envia o radio q for, dps pega o radio de cada tabela e deixa como selecionado e adiciona a classe de selecionado
    document.addEventListener("change", function (e) {
        if (e.target.type === "radio") selecionarLinha(e.target);
    });
    setTimeout(function () {
        let primeiraUsu = $("input[name='equipamentos']").first();
        let primeiraAdm = $("input[name='equipamentosADM']").first();

        primeiraUsu.prop("checked", true).closest("tr").addClass("linha-selecionada");
        primeiraAdm.prop("checked", true).closest("tr").addClass("linha-selecionada");
    }, 100);

    //!-------------------ABRIR MODAL MINHAS RESERVAS E CRIAR RESERVAS-------------------
    //resumo: abrir modal tanto pro adm quanto pro uso
    $("#botaoReservas, #botaoReservasADM").click(function () {
        abrirMinhasReservas();
    });

    $("#botaoCriarReserva, #botaoCriarReservaADM").click(function () {
        $("#criarReserva").modal();
    });

    //!-------------------ORDENAR PELO SELECT-------------------
    //resumo: entrega os parametros para função de ordena q acontece quando muda o select
    $("#selectadm").on("change", function () {
        ordernarSelect("#selectadm", "#vpad-pesqadm", "#adm");
    });

    $("#selectusu").on("change", function () {
        ordernarSelect("#selectusu", "#vpad-pesqusu", ".fundo");
    });

    //!-------------------OUTROS-------------------
    //resumo: sair do usuario atual e recarregar a tela
    $(document).on("click", ".logout", function () {
        sessionStorage.removeItem("usuario");
        location.reload();
    });

    //resumo: quando da focus no input de data aparece o showpicker q seria o calendario(seletor integrado) - tirei com css porque achei feio
    $(document).on("focus", "input[type='date']", function () {
        this.showPicker();
    });

    //resumo: sair da tela de padrão manutenção, soda um reload
    $(".sair").click(function () {
        location.reload();
    });
})
