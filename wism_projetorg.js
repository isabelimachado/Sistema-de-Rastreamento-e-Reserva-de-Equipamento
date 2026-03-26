let cadastrando = false;
let logando = false;

function mostrarSnack(texto, tipo = "info") {
    let cor = "#2196F3";

    if (tipo === "erro") cor = "#e74c3c";
    if (tipo === "sucesso") cor = "#2ecc71";

    Snackbar.show({
        text: texto,
        backgroundColor: cor,
        pos: "top-center",
        duration: 2500,
        actionText: "OK",
        onActionClick: (element) => element.style.opacity = 0,
        customClass: "snack-container",
        actionTextColor: "#ffffff",
    });
}

$(document).ready(function () {

    let usuario = JSON.parse(sessionStorage.getItem("usuario"));
    
    if (usuario) {
        window.vCodUsuarioLogado = usuario.codigo;

        $("#login, #registro").hide();

        $("body").css({
            "background": "#f4f6f9",
            "margin": "6px",
            "flex-direction": "column",
            "display": "flex",
        });

        if (usuario.tipo === "ADM") {
            $("#adm").show();
            $(".fundo2").show();
        } else {
            $(".fundo").show();
        }
        return;
    }

    $(".fundo").hide();
    $("#adm").hide();

    $("#IrTelaRegistra").click(function (e) {
        e.preventDefault();
        $("#login").hide();
        $("#registro").show();
    });

    $("#IrTelaLogin").click(function (e) {
        e.preventDefault();
        $("#login").show();
        $("#registro").hide();
    });

    $("#nome, #setor, #emailRegistro, #senhaRegistro").on("keydown", function (e) {
        if (e.key === "Enter" && !cadastrando) $("#fazerCadastro").trigger("click");
    });

    $("#fazerCadastro").on("click", function (e) {
        e.preventDefault();

        const nome = $("#nome").val().trim();
        const setor = $("#setor").val();
        const email = $("#emailRegistro").val().trim();
        const senha = $("#senhaRegistro").val().trim();

        if (!nome || !setor || !email || !senha) {
            mostrarSnack("Preencha todos os campos!", "info");
            return;
        }

        if (!email.endsWith("@agrosys.com.br")) {
            mostrarSnack("Formato de e-mail inválido!", "erro");
            return;
        }

        if (cadastrando) return;
        cadastrando = true;

        ajax(
            "p_gravar",
            "nome=" + agroEscape(nome) +
            "&setor=" + agroEscape(setor) +
            "&email=" + encodeURIComponent(email) +
            "&senha=" + encodeURIComponent(senha)
        )
        .then((data) => {
            if (data.msg) {
                mostrarSnack(data.msg, "erro");
                cadastrando = false;
                return;
            }

            sessionStorage.setItem("usuario", JSON.stringify({
                codigo: data.vcodigo,
                tipo: data.adm ? "ADM" : "USU"
            }));

            mostrarSnack("Usuário cadastrado!", "sucesso");

            setTimeout(() => {
                location.reload(); 
            }, 1000);
        })
        .catch((error) => {
            console.log(error);
            cadastrando = false;
        });
    });

    $("#emailLogin, #senhaLogin").on("keydown", function (e) {
        if (e.key === "Enter" && !logando) $("#fazerLogin").trigger("click");
    });

    $("#fazerLogin").on("click", function (e) {
        e.preventDefault();

        const email = $("#emailLogin").val().trim();
        const senha = $("#senhaLogin").val().trim();

        if (!email || !senha) {
            mostrarSnack("Preencha e-mail e senha!", "info");
            return;
        }

        if (logando) return;
        logando = true;

        ajax(
            "p_login",
            "email=" + encodeURIComponent(email) +
            "&senha=" + encodeURIComponent(senha)
        )
        .then((data) => {
            if (!data || !data.vcodigo) {
                mostrarSnack("E-mail ou senha inválidos!", "erro");
                logando = false;
                return;
            }

            sessionStorage.setItem("usuario", JSON.stringify({
                codigo: data.vcodigo,
                tipo: data.adm ? "ADM" : "USU"
            }));

            window.vCodUsuarioLogado = data.vcodigo;

            mostrarSnack("Login realizado!", "sucesso");

            setTimeout(() => {
                location.reload();
            }, 1000);
        })
        .catch((error) => {
            console.error(error);
            logando = false;
        });
    });

    $("#logout").click(function () {
        sessionStorage.removeItem("usuario");
        localStorage.removeItem("usuario");
        location.reload();
    });

});