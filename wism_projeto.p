{webpro.i}
{wpadfunc.i}

def var vpad-html1 as longchar.
def var vpad-html2 as longchar.

def var vtpl1      as class Template.
def var vtpl2      as class Template.

def var vdados-retorno as longchar.

procedure output-header:
end procedure.

if get-value("vpad_proc") <> "" then do:
    run value(get-value("vpad_proc")).
    quit.
end.

function fput returns char(vjson as longchar) forward.

run p_load_html.
run p_atualizar_reservas.  
run p_replace_html.        
run p_show_html.

//?registro de usuario, obs: vadm-fput é pq nao dava pra colocar as condicoes dentro do fput
//! ------------------- REGISTRO USUARIO -------------------
procedure p_gravar:
    def var vjson     as longchar.
    def var vultimo   as int.
    def var vadm-fput as char.  

    find first usuarioEquipa where usuarioEquipa.email = get-value("email") no-lock no-error.

    if avail usuarioEquipa then do:
        fput('~{"msg":"Conta ja cadastrada com esse email!"}').
        quit.
    end.

    for last usuarioEquipa no-lock by usuarioEquipa.vcodigo:
        vultimo = usuarioEquipa.vcodigo.
    end.        

    create usuarioEquipa.
    assign
        usuarioEquipa.vcodigo = vultimo + 1
        usuarioEquipa.vnome  = url-decode(get-value("nome"))
        usuarioEquipa.setor = url-decode(get-value("setor"))
        usuarioEquipa.email = get-value("email")
        usuarioEquipa.senha = get-value("senha")
        usuarioEquipa.adm = (lc(get-value("email")) = "adm@agrosys.com.br" and get-value("senha") = "123456789" and lc(get-value("setor")) = "tecnologia")
        vadm-fput = if usuarioEquipa.adm then "true" else "false".  

    fput('~{"adm":' + vadm-fput + ',"vcodigo":' + string(usuarioEquipa.vcodigo) + '~}').
    quit.
end procedure.

procedure p_alterar_reserva:
    def var vid as int.
    def var vdata_inicio as date.
    def var vdata_final as date.

    assign vid = int(get-value("vcodigo_reserva")) no-error.

    find first reservaEquipa exclusive-lock where reservaEquipa.vcodigo_reserva = vid no-error.

    if not avail reservaEquipa then do:
        fput('~{"msg":false~}').
        quit.
    end.

    assign
        vdata_inicio = date(int(get-value("di_mes")), int(get-value("di_dia")), int(get-value("di_ano")))
        vdata_final = date(int(get-value("df_mes")), int(get-value("df_dia")), int(get-value("df_ano"))).

    if vdata_final <= vdata_inicio or  vdata_inicio = reservaEquipa.data_inicio and vdata_final = reservaEquipa.data_final then do:
        fput('~{"msg":false~}').
        quit.
    end.

    assign
        reservaEquipa.data_inicio = vdata_inicio
        reservaEquipa.data_final = vdata_final.

    fput('~{"msg":true~}').
    quit.
end procedure.

//! ------------------- LOGIN USUARIO -------------------
procedure p_login:
    def var vadm-fput as char.

    find first usuarioEquipa no-lock where usuarioEquipa.email = get-value("email") and usuarioEquipa.senha = get-value("senha") no-error.

    if not avail usuarioEquipa then do:
        fput('~{"msg":"E-mail ou senha inválidos"}').
        quit.
    end.

    vadm-fput = if usuarioEquipa.adm then "true" else "false".

    fput('~{"adm":' + vadm-fput + ',"vcodigo":' + string(usuarioEquipa.vcodigo) + '~}').
    quit.
end procedure.

procedure p_load_html:
    copy-lob file "/agroweb/templates/wism_projeto.tpl" to vpad-html1.
    vtpl1 = new Template(vpad-html1).

    copy-lob file "/agroweb/templates/wism_registro.tpl" to vpad-html2.
    vtpl2 = new Template(vpad-html2).
end procedure.

//?resumo: equipamento na tela usuário,na tela de adm equipamento com -- se nn tiver reserva, agora se tiver desse msm equipamento, procura o usuario e o setor dele, dps so atribui tudo para as var do block 
//! ------------------- REPLACE HTML -------------------
procedure p_replace_html:
    def var vcache        as char.
    def var vcodigo_eq    as int.
    def var vusu_adm      as char.
    def var vtipo_adm     as char.
    def var vdata_ini_adm as char.
    def var vdata_fim_adm as char.
    def var vmotivo_adm   as char.

    assign 
        vcache     = string(today,"99999999") + string(time,"999999")
        vcodigo_eq = int(get-value("vcodigo_equipa")) no-error.

    vtpl1:troca("[cache]", vcache).
    vtpl1:block("BLOCK_CACHE").

    vtpl2:troca("[cache]", vcache).
    vtpl2:block("BLOCK_CACHE_REGISTRO").

    for each tipoEquipa no-lock:
        vtpl1:troca("[vcodigotipo]", string(tipoEquipa.vcodigo)).
        vtpl1:troca("[vnometipo]", tipoEquipa.vnometipo).
        vtpl1:block("BLOCK_SELECT_TIPO").
    end.

    for each equipamento where equipamento.vstatus = "Disponível" no-lock:
        vtpl1:troca("[vcodigo]", string(equipamento.codigo)).
        vtpl1:troca("[vnome]", equipamento.vnome).
        vtpl1:block("BLOCK_SELECT_EQUIPA").
    end.

    for each equipamento no-lock:

        assign
            vtipo_adm     = "--"
            vusu_adm      = "--"
            vdata_ini_adm = "--"
            vdata_fim_adm = "--"
            vmotivo_adm   = "--".

        release usuarioEquipa.
        release reservaEquipa.
        release tipoEquipa.

        find last reservaEquipa no-lock 
            where reservaEquipa.vcodigo_equipa = equipamento.codigo 
            and reservaEquipa.vstatus = "Reservado"
            and reservaEquipa.data_final >= today 
            no-error.

        if avail reservaEquipa then
            find first usuarioEquipa no-lock 
                where usuarioEquipa.vcodigo = reservaEquipa.vcodigo_usu no-error.

        find first tipoEquipa no-lock 
            where tipoEquipa.vcodigo = equipamento.vtipo 
            no-error.

        assign
            vtipo_adm     = if avail tipoEquipa then tipoEquipa.vnometipo else "--"
            vusu_adm      = if avail usuarioEquipa then usuarioEquipa.vnome else "--"
            vdata_ini_adm = if avail reservaEquipa and reservaEquipa.data_inicio <> ? then string(reservaEquipa.data_inicio) else "--"
            vdata_fim_adm = if avail reservaEquipa and reservaEquipa.data_final  <> ? then string(reservaEquipa.data_final)  else "--"
            vmotivo_adm   = if avail reservaEquipa and reservaEquipa.motivo <> "" then reservaEquipa.motivo else "--".

        vtpl1:troca("[vcod]", string(equipamento.codigo)).
        vtpl1:troca("[vnome]", equipamento.vnome).
        vtpl1:troca("[vtipo]", vtipo_adm).
        vtpl1:troca("[vusu]", vusu_adm).
        vtpl1:troca("[vdata_inicio]", vdata_ini_adm).
        vtpl1:troca("[vdata_final]", vdata_fim_adm).
        vtpl1:troca("[vmotivo]", vmotivo_adm).
        vtpl1:troca("[vstatus]", equipamento.vstatus).
        vtpl1:block("BLOCK_EQUIPA").
        vtpl1:block("BLOCK_ADM").

    end.
    
end procedure.

//! ------------------- INCLUIR ELEMENTO -------------------
procedure p_incluir_equipamento:
    def var vultimo as int init 0.

    for last equipamento no-lock by equipamento.codigo:
        vultimo = equipamento.codigo.
    end.

    create equipamento.
    assign
        equipamento.codigo  = vultimo + 1
        equipamento.vnome   = url-decode(get-value("vnome"))
        equipamento.vtipo   = int(get-value("vtipo")) 
        equipamento.vstatus = "Disponível".

    fput('~{"msg":true~}').
    quit.
end procedure.

//!------------------- ALTERAR STATUS RESERVA VENCIDA -------------------
procedure p_atualizar_reservas:
    for each reservaEquipa exclusive-lock where reservaEquipa.vstatus = "Reservado" and reservaEquipa.data_final = today:
        find first equipamento exclusive-lock where equipamento.codigo = reservaEquipa.vcodigo_equipa no-error.
        
        if avail equipamento then
            equipamento.vstatus = "Disponível".
            reservaEquipa.vstatus = "Disponível".
        end.
end procedure.


//! NÃO TA DANDO CERTO - deu :)
//?mostrar as reservas das mais recentes, e para baixo as mais antigas algo assim
//! ------------------- MINHAS RESERVAS -------------------
procedure p_minhas_reservas:
    def var vcodigous   as int.
    def var vhtml  as longchar.
    def var vlinha as longchar.

    assign vcodigous = int(get-value("vcodigo_usu")) no-error.

    for each reservaEquipa no-lock 
    where reservaEquipa.vcodigo_usu = vcodigous 
    and reservaEquipa.vstatus = "Reservado"
    by reservaEquipa.data_inicio:
        find first equipamento no-lock where equipamento.codigo = reservaEquipa.vcodigo_equipa no-error.

    assign vlinha =
        '<div class="linhaMinhasReservas">' +
            '<div class="coluna">' + (if avail equipamento then equipamento.vnome else "--") + '</div>' +
            '<div class="coluna">' + string(reservaEquipa.data_inicio) + '</div>' +
            '<div class="coluna">' + string(reservaEquipa.data_final) + '</div>' +
            '<div class="colunaBotoes">' +
                '<button class="botaoCancelar" data-id="' + string(reservaEquipa.vcodigo_reserva) + '">Cancelar</button>' +
                '<button class="botaoAlterar" data-id="' + string(reservaEquipa.vcodigo_reserva) + '">Alterar</button>' +
        '</div>' +
        '</div>'.

        if vhtml = "" then vhtml = vlinha.
        else vhtml = vhtml + vlinha.
    end.

    if vhtml = "" then
        vhtml = '<div class="semReservas">Nenhuma reserva encontrada.</div>'.
    fput(vhtml).
    quit.
end procedure.

procedure p_cancelar_reserva:
    def var vid as int.

    assign vid = int(get-value("vcodigo_reserva")) no-error.

    find first reservaEquipa exclusive-lock 
        where reservaEquipa.vcodigo_reserva = vid no-error.

    if not avail reservaEquipa then do:
        fput('~{"msg":false~}').
        quit.
    end.

    find first equipamento exclusive-lock 
        where equipamento.codigo = reservaEquipa.vcodigo_equipa no-error.

    assign
        reservaEquipa.vstatus = "Cancelado".

    if avail equipamento then
        assign equipamento.vstatus = "Disponível".

    fput('~{"msg":true~}').
end procedure.

//! ------------------- CRIAR RESERVA -------------------
procedure p_criar_reserva:
    def var vultimo      as int init 0.
    def var vcodigo_eq   as int.

    assign vcodigo_eq = int(get-value("vcodigo_equipa")) no-error.

    find first equipamento exclusive-lock where equipamento.codigo = vcodigo_eq no-error.

    if not avail equipamento then do:
         fput('~{"msg":false~}').
        quit.
    end.

    for last reservaEquipa no-lock by reservaEquipa.vcodigo_reserva:
        vultimo = reservaEquipa.vcodigo_reserva.
    end.

    create reservaEquipa.
    assign
        reservaEquipa.vcodigo_reserva = vultimo + 1
        reservaEquipa.vcodigo_equipa = vcodigo_eq
        reservaEquipa.vcodigo_usu = int(get-value("vcodigo_usu")) 
        reservaEquipa.data_inicio = date(int(get-value("di_mes")),int(get-value("di_dia")),int(get-value("di_ano")))

        reservaEquipa.data_final = date(int(get-value("df_mes")),int(get-value("df_dia")),int(get-value("df_ano")))
        reservaEquipa.motivo = url-decode(get-value("motivo"))
        reservaEquipa.vstatus = "Reservado"
        equipamento.vstatus = "Reservado".
    fput('~{"msg":true~}').
    quit.
end procedure.

//! ------------------- ALTERAR STATUS -------------------
procedure p_alterar_status:
    def var vcodigo_eq as int.

    assign vcodigo_eq = int(get-value("vcodigo_equipa")) no-error.

    find first equipamento exclusive-lock where equipamento.codigo = vcodigo_eq no-error.

    if not avail equipamento then do:
        fput('~{"msg":false~}').
        quit.
    end.

    assign equipamento.vstatus = url-decode(get-value("vstatus")).

    find last reservaEquipa exclusive-lock where reservaEquipa.vcodigo_equipa = vcodigo_eq and reservaEquipa.vstatus = "Reservado" no-error.

    if avail reservaEquipa then do:
        assign reservaEquipa.vstatus = "Disponível". 
    end.

    fput('~{"msg":true~}').
    quit.
end procedure.

//! ------------------- FUNÇÕES NAVEGADOR -------------------
procedure p_show_html:
    vtpl1:show().
    vtpl2:show().
end procedure.

function fput returns char (vjson as longchar):
    def var vcont as int.
    def var vnum  as int init 1.

    if length(vjson) > 30000
    then do vcont = 1 to trunc(length(vjson) / 30000,0) + 1:
        {&out} string(substring(vjson,vnum,30000)).
        assign vnum = vnum + 30000.
    end.
    else {&out} string(vjson).
end function.


