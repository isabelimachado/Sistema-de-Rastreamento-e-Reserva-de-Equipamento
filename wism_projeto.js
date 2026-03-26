$(document).ready(function () {

    //!-------------------VALIDACOES USUÁRIO-------------------

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
    } else {
        $(".fundo").show();
        $("#adm").hide();
    }

    //!-------------------FUNCTIONS-------------------

    function Zebra() {
        let linhas = $("table tbody tr:visible");
        linhas.each(function (index) {
            let cor = (index % 2 === 0) ? "#e1f0fd" : "#ffffff";
            $(this).find("td").css("background", cor);
        });
    }

    function selecionarLinha(radio) {
        $(radio).closest("table").find("tbody tr").removeClass("linha-selecionada");
        $(radio).closest("tr").addClass("linha-selecionada");
    }

    function abrirModalCriarReservas() {
        $("#criarReserva").modal({ showClose: true });
    }

    function abrirMinhasReservas() {
        $.get("", {
            vpad_proc: "p_minhas_reservas",
            vcodigo_usu: window.vCodUsuarioLogado
        }, function (html) {
            $("#listaMinhasReservas .linhaMinhasReservas:not(.cabecalho)").remove();
            $("#listaMinhasReservas .semReservas").remove();

            if ($.trim(html) === "" || html.indexOf("semReservas") >= 0) {
                $("#listaMinhasReservas").append('<div class="semReservas">Nenhuma reserva encontrada.</div>');
            } else {
                $("#listaMinhasReservas .cabecalho").after(html);
            }

            $("#minhasReservas").modal({ showClose: true });
        });
    }

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
        }).appendTo(tbody);


        tbody.find("tr").show();
        let primeira = tbody.find("tr:visible").first();
        primeira.find("input[name='" + nomeRadio + "']").prop("checked", true);
        tbody.find("tr").removeClass("linha-selecionada");
        primeira.addClass("linha-selecionada");
        Zebra();
    }


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

    function objectJSON(resp) {
        try {
            return JSON.parse(resp.trim());
        }
        catch {
            return { msg: false };
        }
    }

    //!-------------------HISTORICO SELECT-------------------
    $("#mostrarHistorico").click(function (e) {
        e.preventDefault();

        let codigo = $(".selectEquipa").val();

        if (!codigo) {
            mostrarSnack("Selecione um equipamento!");
            return;
        }

        $("#historicoselect").modal({ showClose: true });
        document.getElementById("iframeGraficoSelect").src =
            "/webpro/weball/wism_grafico?vcodigo_equipa=" + codigo;
    });


    $(".botaoHistorico").click(function () {

        $("#historico").modal({ showClose: true });

        document.getElementById("iframeGrafico").src = "/webpro/weball/wism_grafico";
    });

    $("#botaoCadastroTipo").click(function () {

        $("#padrao").show();
        $("#adm").hide();

        document.getElementById("padraoIframe").src = "/webpro/weball/wism_tiposm";
    });


    //!-------------------ALTERAR DATAS MINHAS RESERVAS-------------------
    $(document).on("click", ".botaoAlterar", function () {
        let linha = $(this).closest(".linhaMinhasReservas");

        let dataInicio = linha.find(".coluna").eq(1).text().trim();
        let dataFinal = linha.find(".coluna").eq(2).text().trim();

        function converterParaInput(data) {
            let partes = data.split("/");
            return partes[2] + "-" + partes[1] + "-" + partes[0];
        }

        let dataInicioFormatada = converterParaInput(dataInicio);
        let dataFinalFormatada = converterParaInput(dataFinal);

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
    $(document).on("click", ".botaoConfirmarAlt", function () {
        let linha = $(this).closest(".linhaMinhasReservas");
        let id = $(this).data("id");

        let dataInicio = linha.find(".inputDataInicio").val();
        let dataFinal = linha.find(".inputDataFinal").val();

        if (!dataInicio || !dataFinal) {
            mostrarSnack("Preencha as datas!", "erro");
            return;
        }

        if (dataFinal <= dataInicio) {
            mostrarSnack("A data final não pode ser menor ou igual à do início!")
            return;
        }

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

            if (res && res.msg) {
                mostrarSnack("Reserva alterada com sucesso!", "sucesso");
                setTimeout(function () {
                    location.reload();
                }, 1500);
            } else {
                mostrarSnack("Erro ao alterar reserva!", "erro");
            }
        });
    });

    //!-------------------CANCELAR EDIÇÃO DE DATAS-------------------
    $(document).on("click", ".botaoCancelarAlt", function () {
        abrirMinhasReservas();
    });
    
    //!-------------------CANCELAR RESERVA-------------------
    $(document).on("click", ".botaoCancelar", function () {
        let id = $(this).data("id");
        let linha = $(this).closest(".linhaMinhasReservas");

        if (!confirm("Deseja cancelar a reserva?")) return;

        $.post("", {
            vpad_proc: "p_cancelar_reserva",
            vcodigo_reserva: id
        }, function (resp) {

            let res = objectJSON(resp);

            if (res && !res.msg) {
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
    $("#botaoAdicionar").click(function () {
        let ultimo = 0;
        $("table tbody tr").each(function () {
            let cod = parseInt($(this).find("td:eq(1)").text().trim());
            if (cod > ultimo) ultimo = cod;
        });

        $("#codigoEquipa").val(ultimo + 1);
        $("#nomeEquipa").val("");
        $("#cadastroEquipamento").modal({ showClose: true });
    });

    //!-------------------CONFIRMAR INCLUIR EQUIPAMENTO-------------------
    $("#botaoConfirmarEquipa").click(function () {
        let nome = $("#nomeEquipa").val().trim();
        let tipo = $("#tipoEquipa").val();

        if (!nome || !tipo) {
            mostrarSnack("Preencha todos os campos!");
            return;
        }

        let ultimo = 0;
        $("table tbody tr").each(function () {
            let cod = parseInt($(this).find("td:eq(1)").text().trim());
            if (cod > ultimo) ultimo = cod;
        });
        let novoCod = ultimo + 1;

        $.get("", {
            vpad_proc: "p_incluir_equipamento",
            vnome: agroEscape(nome),
            vtipo: agroEscape(tipo)
        }, function (resp) {
            let res = objectJSON(resp);

            if (res.msg) {

                let admAtualizado =
                    `<tr>
                        <td style="width:20px;"><input type="radio" name="equipamentosADM"></td>
                        <td style="text-align:center;">${novoCod}</td>
                        <td>${nome}</td>
                        <td>${tipo}</td>
                        <td>--</td>
                        <td>--</td>
                        <td>--</td>
                        <td>--</td>
                        <td style="text-align:center;">Disponível</td>
                    </tr>`;

                $("#adm table tbody").append(admAtualizado);
                $.modal.close();
                Zebra();
                mostrarSnack("Equipamento incluído com sucesso!", "sucesso");
            } else {
                mostrarSnack("Erro ao incluir equipamento!", "erro");
            }
        });
    });

    //!-------------------ALTERAR EQUIPAMENTO MODAL-------------------
    $("#botaoAlterar").click(function () {
        let selecionado = $("input[name='equipamentosADM']:checked");

        let nome = selecionado.closest("tr").find("td:eq(2)").text();
        let statusAtual = selecionado.closest("tr").find("td:last").text().trim();

        $("#selectStatus").val(statusAtual);
        $("#statusEquipa").text(statusAtual);
        $("#EquipaNome").text(nome);

        if (statusAtual.toLowerCase() == "reservado") {
            mostrarSnack("Não tem como alterar status, porque está reservado!", "erro")
            return;
        }

        $("#alterarStatus").modal({ showClose: true });
    });

    //!-------------------CONFIRMAR ALTERAR EQUIPAMENTO-------------------
    $("#botaoConfirmarSt").click(function () {
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

            if (res.msg) {
                let linha = selecionado.closest("tr");
                linha.find("td:last").text(novoStatus);

                linha.find("td").eq(4).text("--");
                linha.find("td").eq(5).text("--");
                linha.find("td").eq(6).text("--");
                linha.find("td").eq(7).text("--");

                Zebra();
                $.modal.close();

                mostrarSnack("Status alterado com sucesso!", "sucesso");

            } else {
                mostrarSnack("Erro ao alterar status!", "erro");
            }
        });
    });

    //!-------------------CONFIRMAR CRIAR RESERVA-------------------
    $("#botaoConfirmar").click(function () {
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

            if (res.msg) {
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
    $("#dataiADM, #datafADM").on("change", function () {
        let dataI = $("#dataiADM").val();
        let dataF = $("#datafADM").val();
        let linhas = $("table tbody tr");
        let tabelaCondicao = false;

        if (!dataI && !dataF) {
            Zebra();
            linhas.show();
            $("table").show();
            return;
        }


        linhas.each(function () {
            let textoDataI = $(this).find("td:eq(5)").text().trim();
            let textoDataF = $(this).find("td:eq(6)").text().trim();

            if (textoDataI === "--" || textoDataF === "--") {
                $(this).hide();
                return;
            }

            function converterData(str) {
                let partes = str.split("/");
                if (partes.length !== 3) return null;
                return `${partes[2]}-${partes[1]}-${partes[0]}`;
            }

            let diReserva = converterData(textoDataI);
            let dfReserva = converterData(textoDataF);

            if (!diReserva || !dfReserva) {
                $(this).hide();
                return;
            }

            let mostrar = true;
            if (dataI && dfReserva < dataI) mostrar = false;
            if (dataF && diReserva > dataF) mostrar = false;
            $(this).toggle(mostrar);
            if (mostrar) tabelaCondicao = true;
        });

        $("table").toggle(tabelaCondicao);
        Zebra();

        let primeiraVisivel = $("table tbody tr:visible").first();
        primeiraVisivel.find("input[name='equipamentosADM']").prop("checked", true);
        $("tbody tr").removeClass("linha-selecionada");
        primeiraVisivel.addClass("linha-selecionada");
    });

    //! ------------------- EVENTOS-------------------

    //! -------------------PESQUISA ADM E USU-------------------
    $("#vpad-pesqusu").on("keydown", function (e) {
        if (e.key !== "Enter") return;
        let valor = $(this).val().trim().toLowerCase();
        let tipo = $("#selectusu").val();
        let linhas = $("table tbody tr");
        let tabelaCondicao = false;

        if (valor === "") {
            linhas.show();
            $("table").show();
            let primeira = $("table tbody tr:visible").first();
            primeira.find("input[name='equipamentos']").prop("checked", true);
            $("tbody tr").removeClass("linha-selecionada");
            primeira.addClass("linha-selecionada");
            Zebra();
            return;
        }

        linhas.each(function () {
            let codigo = $(this).find("td:eq(1)").text().trim();
            let nome = $(this).find("td:eq(2)").text().toLowerCase();
            let tipoEquipa = $(this).find("td:eq(3)").text().toLowerCase();
            let vstatus = $(this).find("td:eq(4)").text().toLowerCase();
            let mostrar;

            if (tipo === "Código") {
                let numValor = Number(valor);
                mostrar = (numValor === 0) ? true : Number(codigo) >= numValor;
            }

            if (tipo === "Nome") {
                mostrar = nome.includes(valor);
            }

            if (tipo === "Tipo") {
                mostrar = tipoEquipa.includes(valor);
            }

            if (tipo === "Status") {
                mostrar = valor == vstatus;
            }

            $(this).toggle(mostrar);

            if (mostrar) tabelaCondicao = true;
        });

        $("table").toggle(tabelaCondicao);

        Zebra();
        let primeiraVisivel = $("table tbody tr:visible").first();
        primeiraVisivel.find("input[name='equipamentos']").prop("checked", true);
        $("tbody tr").removeClass("linha-selecionada");
        primeiraVisivel.addClass("linha-selecionada");
    });


    $("#vpad-pesqadm").on("keydown", function (e) {
        if (e.key !== "Enter") return;
        let valor = $(this).val().trim().toLowerCase();
        let tipo = $("#selectadm").val();
        let linhas = $("table tbody tr");
        let tabelaCondicao = false;

        if (valor === "") {
            linhas.show();
            $("table").show();
            let primeira = $("table tbody tr:visible").first();
            primeira.find("input[name='equipamentosADM']").prop("checked", true);
            $("tbody tr").removeClass("linha-selecionada");
            primeira.addClass("linha-selecionada");
            Zebra();
            return;
        }

        if (tipo === "Nome") {
            ordenarPorNome();
        }

        linhas.each(function () {
            let codigo = $(this).find("td:eq(1)").text().trim();
            let nome = $(this).find("td:eq(2)").text().toLowerCase();
            let tipoEquipa = $(this).find("td:eq(3)").text().toLowerCase();
            let vstatus = $(this).find("td:eq(8)").text().toLowerCase();
            let mostrar;

            if (tipo === "Código") {
                let numValor = Number(valor);
                mostrar = (numValor === 0) ? true : Number(codigo) >= numValor;
            }

            if (tipo === "Nome") {
                mostrar = nome.includes(valor);
            }

            if (tipo === "Tipo") {
                mostrar = tipoEquipa.includes(valor);
            }

            if (tipo === "Status") {
                mostrar = valor == vstatus;
            }

            $(this).toggle(mostrar);

            if (mostrar) tabelaCondicao = true;
        });

        $("table").toggle(tabelaCondicao);

        Zebra();
        let primeiraVisivel = $("table tbody tr:visible").first();
        primeiraVisivel.find("input[name='equipamentosADM']").prop("checked", true);
        $("tbody tr").removeClass("linha-selecionada");
        primeiraVisivel.addClass("linha-selecionada");
    });

    //!-------------------ORDENAR PELO SELECT-------------------
    $("#selectadm").on("change", function () {
        ordernarSelect("#selectadm", "#vpad-pesqadm", "equipamentosADM", "#adm");
    });

    $("#selectusu").on("change", function () {
        ordernarSelect("#selectusu", "#vpad-pesqusu", "equipamentos", ".fundo");
    });

    //!-------------------ABRIR MODAL MINHAS RESERVAS E CRIAR RESERVAS-------------------
    $("#botaoCriarReserva, #botaoCriarReservaADM").click(function () {
        abrirModalCriarReservas();
    });


    $("#botaoReservas, #botaoReservasADM").click(function () {
        abrirMinhasReservas();
    });

    //!-------------------CLASSE PARA RADIOS SELECIONADOS-------------------
    document.addEventListener("change", function (e) {
        if (e.target.type === "radio") selecionarLinha(e.target);
    });
    setTimeout(function () {
        let primeiraUsu = $("input[name='equipamentos']").first();
        let primeiraAdm = $("input[name='equipamentosADM']").first();

        primeiraUsu.prop("checked", true).closest("tr").addClass("linha-selecionada");
        primeiraAdm.prop("checked", true).closest("tr").addClass("linha-selecionada");
    }, 100);

    $(document).on("click", ".logout", function (e) {
        e.preventDefault();

        sessionStorage.removeItem("usuario");

        location.reload();
    });
})
