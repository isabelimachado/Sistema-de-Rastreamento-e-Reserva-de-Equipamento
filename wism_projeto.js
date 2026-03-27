$(document).ready(function () {
    //!-------------------VALIDACOES USUÁRIO-------------------
    //resumo: pega código do usuario cadastrado no navegador,cria uma variavel q retorna um json q vira um object com as info do usuario, dps atribui o codigo do navegador para ele, e verifica senao tiver usuario as telas principais ficam fechadas
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
            } else {
                $("#listaMinhasReservas .cabecalho").after(html);
            }

            $("#minhasReservas").modal();
        });
    }
    //resumo: função so para realizar uma ação uma vez quando clica várias vezes num botão :)
    //?refazer isso aqui pra cada mudança no input
    function botaoUmaVez(botao) {
        if (botao.prop("disabled")) return false;
        botao.prop("disabled", true);
        return true;
    }

    //resumo: pega o tipo pelo select (adm ou usu) o tbody q vai ser percorrido, e atribui sempre "" pro input quando ordena, pega todas as linhas da tbody e compara duas vezes  sort(a,b) -ordena, se for nome, na coluna 2 se A vim antes q B vai retorna -1, senao 1, msm logica pros dms e dps adiciona no tbody conforme, so no tipo eu inverti pq achei melhor mostra os reservados primeiro, por fim /mostra nova tabela pega o primeiro q a tr tiver visivel e se for o radio do usu e adm, atribui checked e adiciona a classe das bordas
    function ordernarSelect(select, inputPesquisa, nomeRadio, tabela) {
        let tipo = $(select).val();
        let tbody = $(tabela + " table tbody");

        $(inputPesquisa).val("");

        tbody.find("tr").sort((a, b) => {
            if (tipo === "Nome")
                return $(a).find("td:eq(2)").text().toLowerCase() < $(b).find("td:eq(2)").text().toLowerCase() ? -1 : 1;
            if (tipo === "Status")
                return $(b).find("td:last").text().toLowerCase() < $(a).find("td:last").text().toLowerCase() ? -1 : 1;
            if (tipo === "Tipo")
                return $(a).find("td:eq(3)").text().toLowerCase() < $(b).find("td:eq(3)").text().toLowerCase() ? -1 : 1;
            return parseInt($(a).find("td:eq(1)").text()) - parseInt($(b).find("td:eq(1)").text());
        })
            .appendTo(tbody);
        tbody.find("tr").show();
        let primeira = tbody.find("tr:visible").first();
        primeira.find("input[name='" + nomeRadio + "']").prop("checked", true);
        tbody.find("tr").removeClass("linha-selecionada");
        primeira.addClass("linha-selecionada");
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
    //resumo: função para facilitar na hora q recebe o json do progress para transformar em object para mensgaem 
    function objectJSON(resp) {
        try {
            return JSON.parse(resp.trim());
        }
        catch {
            return { msg: false };
        }
    }

    //!-------------------HISTORICO SELECT-------------------
    //resumo: verifica se selecionou algum equipamento, se sim abre o modal q tem o iframe com o histórico filtrado pelo cóidgo do equipa
    $("#mostrarHistorico").click(function (e) {
        e.preventDefault();
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
    //resumo: depois que clica no botão de confirmar alteração, pega a linha do alterar, id do botão para saber qual é a reserva, abre a requisição, fala a proceure, especifica o id, separa o dia,mes e ano para o formato do progress (mmm/dd/aaaa) com -, dps valida a resposta que o progress manda
    $(document).on("click", ".botaoConfirmarAlt", function () {
        let botao = $(this);
        if (!botaoUmaVez(botao)) return;

        let linha = $(this).closest(".linhaMinhasReservas");
        let id = $(this).data("id");

        let dataInicio = linha.find(".inputDataInicio").val(); // pega os valores
        let dataFinal = linha.find(".inputDataFinal").val();

        let partesInicio = dataInicio.split("-");
        let partesFinal = dataFinal.split("-");

        $.post("", {
            vpad_proc: "p_alterar_reserva",
            vcodigo_reserva: id,
            di_mes: partesInicio[1],
            di_dia: partesInicio[2],
            di_ano: partesInicio[0],
            df_mes: partesFinal[1],
            df_dia: partesFinal[2],
            df_ano: partesFinal[0]
        }, function (resp) {
            let res = objectJSON(resp);

            if (res) {
                mostrarSnack("Reserva alterada com sucesso!", "sucesso");
                location.reload();
            } else {
                mostrarSnack("Erro ao alterar reserva!", "erro");
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

        $.post("", {
            vpad_proc: "p_cancelar_reserva",
            vcodigo_reserva: id
        }, function (resp) {

            let res = objectJSON(resp);

            if (res) {
                linha.remove();

                let linhasRestantes = $("#listaMinhasReservas .linhaMinhasReservas").length;
                if (linhasRestantes <= 1) {
                    $("#listaMinhasReservas").append('<div class="semReservas">Nenhuma reserva encontrada.</div>');
                }

                Zebra();
                mostrarSnack("Reserva cancelada com sucesso!", "sucesso");
                location.reload();
            } else {
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
            return;
        }

        $.get("", {
            vpad_proc: "p_incluir_equipamento",
            vnome: agroEscape(nome),
            vtipo: tipo
        }, function (resp) {
            let res = objectJSON(resp);

            if (res) {
                mostrarSnack("Equipamento incluído com sucesso!", "sucesso");
                location.reload();
            } else {
                mostrarSnack("Erro ao incluir equipamento!", "erro");
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
    $("#botaoConfirmarSt").click(function () {
        //resumo: pega codigo do selecionado,status e o status do select, se for igual ambos, não vai salvar, senao envia tudo pro progress código e novo status e altera 
        let botao = $(this);
        if (!botaoUmaVez(botao)) return;
        let selecionado = $("input[name='equipamentosADM']:checked");
        let codigo = selecionado.closest("tr").find("td:eq(1)").text().trim();
        let novoStatus = $("#selectStatus").val().trim();
        let statusAtual = selecionado.closest("tr").find("td:last").text().trim();

        if (statusAtual === novoStatus) {
            mostrarSnack("Não tem como mudar para este status, porque já está " + statusAtual.toLowerCase())
            return;
        }

        $.get("", {
            vpad_proc: "p_alterar_status",
            vcodigo_equipa: codigo,
            vstatus: agroEscape(novoStatus)
        }, function (resp) {
            let res = objectJSON(resp);

            if (res) {
                Zebra();
                mostrarSnack("Status alterado com sucesso!", "sucesso");
                location.reload();
            } else {
                mostrarSnack("Erro ao alterar status!", "erro");
            }
        });
    });

    //!-------------------CONFIRMAR CRIAR RESERVA-------------------
    $("#botaoConfirmar").click(function () {
        let botao = $(this);
        if (!botaoUmaVez(botao)) return;
        let dataInicio = $("#dataInicio").val();
        let dataFinal = $("#dataFinal").val();
        let codigoEquipa = $(".selectEquipa").val();
        let motivo = $("#motivo").val().trim();
        let hoje = new Date().toISOString().split("T")[0];

        if (!dataInicio || !dataFinal || !motivo || !codigoEquipa) {
            mostrarSnack("Preencha todos os campos!")
            return;
        }
        if (dataInicio < hoje) {
            mostrarSnack("Está data não bate com a atual!")
            return;
        }

        if (dataFinal <= dataInicio) {
            mostrarSnack("A data final não pode ser menor ou igual à do início!")
            return;
        }

        let partes = dataInicio.split("-");
        let partes2 = dataFinal.split("-");

        $.get("", {
            vpad_proc: "p_criar_reserva",
            vcodigo_equipa: codigoEquipa,
            vcodigo_usu: window.vCodUsuarioLogado,
            di_mes: partes[1],
            di_dia: partes[2],
            di_ano: partes[0],
            df_mes: partes2[1],
            df_dia: partes2[2],
            df_ano: partes2[0],
            motivo: agroEscape(motivo)
        }, function (resp) {
            let res = objectJSON(resp);

            if (res) {
                mostrarSnack("Reserva criada com sucesso!", "sucesso");
                $.modal.close();
                Zebra();
                location.reload();
            } else {
                mostrarSnack("Erro ao criar reserva!", "erro");
            }
        });
    });


    //!-------------------FILTRO DATAF E DATAI-------------------
    $(document).on("change", "#datai, #dataf, .datai, .dataf", function () {
        let $input = $(this);
        let container = $input.closest(".fundo").length ? $input.closest(".fundo") : $input.closest("#adm");

        let isMain = container.hasClass("fundo");
        let valI = isMain ? container.find("#datai").val() : container.find(".datai").val();
        let valF = isMain ? container.find("#dataf").val() : container.find(".dataf").val();

        function converterDataNumero(str) {
            if (!str || str.trim() === "" || str.includes("--")) return null;
            str = str.trim();
            let dia, mes, ano;

            if (str.includes("-")) {
                let partes = str.split("-");
                [ano, mes, dia] = partes;
            } else if (str.includes("/")) {
                let partes = str.split("/");
                [dia, mes, ano] = partes;
            } else { return null; }

            if (ano.length === 2) ano = "20" + ano;
            return parseInt(ano + mes.padStart(2, "0") + dia.padStart(2, "0"));
        }

        let fIni = converterDataNumero(valI);
        let fFim = converterDataNumero(valF);

        let linhas = container.find("table tbody tr");
        let encontrou = false;

        linhas.each(function () {
            let $linha = $(this);
            let rIni = converterDataNumero($linha.find("td:eq(5)").text());
            let rFim = converterDataNumero($linha.find("td:eq(6)").text());

            let mostrar = true;

            if (!fIni && !fFim) {
                mostrar = true;
            } else {
                if (fIni && rIni < fIni) {
                    mostrar = false;
                }
                if (fFim && rFim > fFim) {
                    mostrar = false;
                }
                if (!rIni || !rFim) mostrar = false;
            }

            $linha.toggle(mostrar);
            if (mostrar) encontrou = true;
        });

        container.find("table").toggle(encontrou);
        if (typeof Zebra === "function") Zebra();

        let $primeira = linhas.filter(":visible").first();
        if ($primeira.length) {
            $primeira.find("input[type='radio']").prop("checked", true);
            linhas.removeClass("linha-selecionada");
            $primeira.addClass("linha-selecionada");
        }
    });

    //! ------------------- EVENTOS-------------------

    //! -------------------PESQUISA ADM E USU-------------------
    //resumo: sempre que alterar algo no input de adm ou usario, e der enter, id atual pega o id da tela q está , valor do input, e atribui pro select os id correspondente ao input, msm coisa pro radio , pega o valor do select q for, pega a linhas da tabela, e atribui no comeco a tabela como false, percorre as linhas da tabela, pega da campo q quer, faz uma variavel bool se for pra mostra na tabela, se nao tiver nada no input so mostra a tela normal, senao e se o tipo for codigo vai mostra so numero digitado e numeros maiores q ele, se for nome vai mostra td que tiver algo q foi digitado, já no tipo é exato, se mostrar for true mostra,  adicona a condicao da tabela, por ultimo é so atribuir a class para o radio que for e deixa ele selecionado
    $("#vpad-pesqusu, #vpad-pesqadm").on("keydown", function (e) {
        if (e.key !== "Enter") return;

        let idAtual = $(this).attr("id");
        let valor = $(this).val().trim().toLowerCase();

        let idSelect = (idAtual === "vpad-pesqusu") ? "#selectusu" : "#selectadm";
        let nomeRadio = (idAtual === "vpad-pesqusu") ? "equipamentos" : "equipamentosADM";

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

        let primeiraVisivel = $("table tbody tr:visible").first();
        primeiraVisivel.find(`input[name='${nomeRadio}']`).prop("checked", true);
        $("tbody tr").removeClass("linha-selecionada");
        primeiraVisivel.addClass("linha-selecionada");
    });

    //!-------------------CLASSE PARA RADIOS SELECIONADOS-------------------
    //resumo: adicionar um linstener q ve cada mudanca do radio e se for algum radio selecionado realiza a função e envia o radio q for, dps pega o radio de cada tabela e deixa como selecionado e adiciona a classe de selecionado
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
        ordernarSelect("#selectadm", "#vpad-pesqadm", "equipamentosADM", "#adm");
    });

    $("#selectusu").on("change", function () {
        ordernarSelect("#selectusu", "#vpad-pesqusu", "equipamentos", ".fundo");
    });

    //!-------------------OUTROS-------------------
    //resumo: sair do usuario atual e recarregar a tela
    $(document).on("click", ".logout", function () {
        sessionStorage.removeItem("usuario");
        location.reload();
    });
    //resumo: quando da click/focus no input de data aparece o showpicker q seria o clanedario
    $(document).on("focus", "input[type='date']", function () {
        this.showPicker();
    });
    //resumo: sair da tela de padrão manutenção, soda um reload
    $(".sair").click(function () {
        location.reload();
    });
})
