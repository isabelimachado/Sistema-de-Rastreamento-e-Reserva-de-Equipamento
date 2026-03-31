let cadastrando = false;
let logando = false;
//flags para não dar clique duas vezes quando já fizer login/registro

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
    //resumo: pega usuario que tiver salvo no navegador e verifica se tiver logado, se tiver esconde as telas de registro/login e aplica o estilo do body padrão das tela,agora se nao tiver, as telas ficam escondidas 
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
        return;
    }
    $(".fundo").hide();
    $("#adm").hide();

    $("#IrTelaRegistra").click(function () {
        $("#login").hide();
        $("#registro").show();
    });

    $("#IrTelaLogin").click(function () {
        $("#login").show();
        $("#registro").hide();
    });

    //resumo: se tiver dado enter e não tiver cadastrando, isso em qlqr input, ele da click no botão de cadastro
    $("#nome, #setor, #emailRegistro, #senhaRegistro").on("keydown", function (e) {
        if (e.key === "Enter" && !cadastrando) 
        $("#fazerCadastro").trigger("click");
    });
    //resumo: pega valor de cada campo tirando os espaços, faz validação de campos, todo email devem terminar com  @agrosys.com.br, envia pro ajax, se vier a msg de erro vai fica falso e mostra o snack, pega as informacoes do json.session do usuario, código e se for adm, faz um ternerario no caso
    $("#fazerCadastro").on("click", function () {
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
        if (e.key === "Enter" && !logando) 
        $("#fazerLogin").trigger("click");
    });

    $("#fazerLogin").on("click", function () {
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

});
