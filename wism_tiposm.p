{webpro.i}
{wpadfunc.i}

def var vpad-html1 as longchar.
def var vpad-html2 as longchar.
def var vtpl1      as class Template.
def var vtpl2      as class Template.

procedure output-header:
end procedure.

/* responsável pelo fluxo principal entre js e progress: se tiver algum chamado da requisição ex: "p_alterar", roda ele e dps monta a tela*/if get-value("vpad_proc") <> "" 
then do:
    run value(get-value("vpad_proc")).
    quit.
end.

function fput returns char(vjson as longchar) forward.

run p_load_html.
run p_atualizar_reservas.  
run p_replace_html.        
run p_show_html.

//?registro de usuario, obs: vadm-fput é pq nao dava pra colocar as condicoes dentro do fput
/* resumo: pega o primeiro usuario que tiver o mesmo email que foi gitiado no input, se tiver mostra que não tem como cadastrar, pega o último código de usuário que tiver, e faz o create que vai adicionar mais um do ultimo e adicionar os get value nos campos da tabela usuario, no */
//! ------------------- REGISTRO USUARIO -------------------
procedure p_gravar:
    def var vjson     as longchar.
    def var vultimo   as int.
    def var vadm-fput as char.  

    find first usuarioEquipa where 
        usuarioEquipa.email = get-value("email") no-lock no-error.

    if avail usuarioEquipa 
    then do:
        fput('~{"msg":"Conta ja cadastrada com esse email!"}').
        quit.
    end.

    for last usuarioEquipa no-lock by usuarioEquipa.vcodigo:
        vultimo = usuarioEquipa.vcodigo.
    end.        

    create usuarioEquipa.
    assign usuarioEquipa.vcodigo = vultimo + 1
        usuarioEquipa.vnome   = url-decode(get-value("nome"))
        usuarioEquipa.setor   = url-decode(get-value("setor"))
        usuarioEquipa.email   = get-value("email")
        usuarioEquipa.senha   = get-value("senha")
        usuarioEquipa.adm     = (lc(get-value("email")) = "adm@agrosys.com.br" and get-value("senha") = "123456789" and lc(get-value("setor")) = "tecnologia")
        vadm-fput             = string(usuarioEquipa.adm,"true/false").
    
    fput('~{"adm":' + vadm-fput + ',"vcodigo":' + string(usuarioEquipa.vcodigo) + '~}').
    quit.
end procedure.

//!------------------- LOGIN USUARIO -------------------
/* resumo: pega o usuario que tiver o msm email e senha digitado no js, se não tiver vai manda como senha invalida, se o usuario for adm retorna true senão false */
procedure p_login:
    def var vadm-fput as char.

    find first usuarioEquipa no-lock 
         where usuarioEquipa.email = get-value("email") and usuarioEquipa.senha = get-value("senha") no-error.

    if not avail usuarioEquipa 
    then do:
        fput('~{"msg":"E-mail ou senha inválidos"}').
        quit.
    end.

    vadm-fput = if usuarioEquipa.adm 
                   then "true" else "false".

    fput('~{"adm":' + vadm-fput + ',"vcodigo":' + string(usuarioEquipa.vcodigo) + '~}').
    quit.
end procedure.

/* resumo: carregar template do registro/login e do projeto*/
procedure p_load_html:
    copy-lob file "/agroweb/templates/wism_projeto.tpl" to vpad-html1.
    vtpl1 = new Template(vpad-html1).
    copy-lob file "/agroweb/templates/wism_registro.tpl" to vpad-html2.
    vtpl2 = new Template(vpad-html2).
end procedure.

//!------------------- REPLACE HTML -------------------
/* resumo: primeiro vcache é a variavel que faz força a recarga de recurso, percorre os tipos de equipamento e faz um block, que vai fica responsavel de aparecer lá na tela de incluir equipamento, tambem o select de equipamento disponivel para criar reserva*/
procedure p_replace_html:
    def var vcache        as char.
    def var vcodigoEq     as int.
    def var vusu          as char.
    def var vtipo         as char.
    def var vdataIni      as char.
    def var vdataFim      as char.
    def var vmotivo       as char.

    assign 
        vcache     = string(today,"99999999") + string(time,"999999")
        vcodigoEq = int(get-value("vcodigo_equipa")) no-error
    .

    vtpl1:troca("[cache]", vcache).
    vtpl1:block("BLOCK_CACHE").

    vtpl2:troca("[cache]", vcache).
    vtpl2:block("BLOCK_CACHE_REGISTRO").

    for each tipoEquipa no-lock:
        vtpl1:troca("[vcodigotipo]", string(tipoEquipa.vcodigo)).
        vtpl1:troca("[vnometipo]", tipoEquipa.vnometipo).
        vtpl1:block("BLOCK_SELECT_TIPO").
    end.

    for each equipamento where 
        equipamento.vstatus = "Disponível" no-lock:
        vtpl1:troca("[vcodigo]", string(equipamento.codigo)).
        vtpl1:troca("[vnome]", equipamento.vnome).
        vtpl1:block("BLOCK_SELECT_EQUIPA").
    end.

    /*percorre equipamento, reservas do equipamento que tiverem como status da reserva como "reservado" e a data de inicio for menor e igual a de hoje e a dinal maior e igual a de hoje, pega o primeiro usuario que tiver relacionado com a reserva, e atriui */    
    for each equipamento no-lock:
        /*release: limpa o buffer para não aparecer*/
        release usuarioEquipa.
        release reservaEquipa.
        release tipoEquipa.

        /*pega as reserva que forem de hoje, reservadas , encontra usuario, leave apos achar*/
        for each reservaEquipa no-lock where 
            reservaEquipa.vcodigo_equipa = equipamento.codigo and reservaEquipa.vstatus = "Reservado" and reservaEquipa.data_inicio <= today and reservaEquipa.data_final >= today:

            find first usuarioEquipa no-lock where 
                 usuarioEquipa.vcodigo = reservaEquipa.vcodigo_usu no-error.
    
            assign
                vdataIni = string(reservaEquipa.data_inicio)
                vdataFim = string(reservaEquipa.data_final)
                vmotivo   = reservaEquipa.motivo
            .
            leave.
        end.
        
        /*validacao para achar usuario da reserva*/
        if avail reservaEquipa then
        find first usuarioEquipa no-lock where 
             usuarioEquipa.vcodigo = reservaEquipa.vcodigo_usu no-error.

        /*depois encontra o tipo de equipamento igual ao do equipamento*/
        find first tipoEquipa no-lock where 
             tipoEquipa.vcodigo = equipamento.vtipo no-error.
        
        /*aqui verificações caso não tenha ou seja ? ent --*/
        assign
            vtipo     = if avail tipoEquipa    then tipoEquipa.vnometipo                                                 else "--"
            vusu      = if avail usuarioEquipa then usuarioEquipa.vnome                                                  else "--"
            vdataIni  = if avail reservaEquipa and reservaEquipa.data_inicio <> ? then string(reservaEquipa.data_inicio) else "--"
            vdataFim  = if avail reservaEquipa and reservaEquipa.data_final  <> ? then string(reservaEquipa.data_final)  else "--"
            vmotivo   = if avail reservaEquipa and reservaEquipa.motivo <> ""     then reservaEquipa.motivo              else "--".

        vtpl1:troca("[vcod]", string(equipamento.codigo)).
        vtpl1:troca("[vnome]", equipamento.vnome).
        vtpl1:troca("[vtipo]", vtipo).
        vtpl1:troca("[vusu]", vusu).
        vtpl1:troca("[vdata_inicio]", vdataIni).
        vtpl1:troca("[vdata_final]", vdataFim).
        vtpl1:troca("[vmotivo]", vmotivo).
        vtpl1:troca("[vstatus]", equipamento.vstatus).
        vtpl1:block("BLOCK_EQUIPA").
        vtpl1:block("BLOCK_ADM").
    end.
    
end procedure.

//!------------------- ALTERAR DATA RESERVA -------------------
/*resumo: pega id da reserva, procura se tem reserva com aquela entrega, se não tiver, coloc no msg, depois pega cada dia,mes,ano e construi um data, depois verificacoes, se data inicio for menor q hoje, data final menor que a inicial, datas iguais já que nao faz sentido tb, depois percorre todas as reservas daquele equipamento, verifica se a data inicio comeca antes do fim e se a data final termina depois do inicio, marca conflito, se tiver conflito envia msg, depois atualiza datas e sai denovo para nao ocorre erro */
procedure p_alterar_reserva:
    def var vid              as int.
    def var vdataInicio      as date.
    def var vdataFinal       as date.
    def var vcodigoEq        as int.
    def var vReservaConflito as log init false.

    assign vid = int(get-value("vcodigo_reserva")) no-error.

    find first reservaEquipa exclusive-lock where 
         reservaEquipa.vcodigo_reserva = vid no-error.

    if not avail reservaEquipa 
    then do:
        fput('~{"msg":"Reserva não encontrada"}').
        quit.
    end.

    assign
        vdataInicio = date(int(get-value("di_mes")), int(get-value("di_dia")), int(get-value("di_ano")))
        vdataFinal = date(int(get-value("df_mes")), int(get-value("df_dia")), int(get-value("df_ano")))
        vcodigoEq = reservaEquipa.vcodigo_equipa
    .

    if vdataInicio < today 
    then do:
        fput('~{"msg":"data inicial menor que hoje"}').
        quit.
    end.

    if vdataFinal <= vdataInicio 
    then do:
        fput('~{"msg":"data final menor que a incial"}').
        quit.
    end.

    if vdataInicio = reservaEquipa.data_inicio and vdataFinal = reservaEquipa.data_final 
    then do:
        fput('~{"msg":"datas iguais"}').
        quit.
    end.

    for each reservaEquipa where 
        reservaEquipa.vcodigo_equipa = vcodigo_eq and reservaEquipa.vcodigo_reserva <> vid and reservaEquipa.vstatus = "Reservado" no-lock:
        
    if vdataInicio <= reservaEquipa.data_final and vdataFinal >= reservaEquipa.data_inicio 
    then do:
            vReservaConflito = true.
            leave.
        end.
    end.

    if vReservaConflito 
    then do:
        fput('~{"msg":"conflito datas"}').
        quit.
    end.

    find first reservaEquipa exclusive-lock where 
    reservaEquipa.vcodigo_reserva = vid no-error.

    assign
        reservaEquipa.data_inicio = vdataInicio
        reservaEquipa.data_final  = vdataFinal
    .

    fput('~{"msg":true~}').
    quit.
end procedure.

//! ------------------- INCLUIR ELEMENTO -------------------
/*resumo: pega ultimo código que tiver e substitui na variavel de último, faz o create e adiciona dentro dos campos oque foi digitado*/procedure p_incluir_equipamento:
    def var vultimo as int init 0.

    for last equipamento no-lock by equipamento.codigo:
        vultimo = equipamento.codigo.
    end.

    create equipamento.
    assign
        equipamento.codigo  = vultimo + 1
        equipamento.vnome   = url-decode(get-value("vnome"))
        equipamento.vtipo   = int(get-value("vtipo")) 
        equipamento.vstatus = "Disponível"
    .

    fput('~{"msg":true~}').
    quit.
end procedure.

//!------------------- ALTERAR STATUS RESERVA VENCIDA -------------------
/*resumo: pega todas as reservas que tem status como reservado e a data final for hoje, pega o equipamento daquela reserva e atribui tanto o status do eqipamento e da reserva como disponível*/
procedure p_atualizar_reservas:

    for each reservaEquipa exclusive-lock where 
        reservaEquipa.vstatus = "Reservado" and reservaEquipa.data_final = today:

        find first equipamento exclusive-lock where 
             equipamento.codigo = reservaEquipa.vcodigo_equipa no-error.
    
        if avail equipamento 
        then do:
            equipamento.vstatus = "Disponível".
            reservaEquipa.vstatus = "Disponível".
        end.
    end. 
end procedure.

//! ------------------- MINHAS RESERVAS -------------------
/* resumo: pega código global do usuario, percorre as reservas que tenham usuario vinculado com a reserva e que a usuario tenha status reservado, pegam o primeiro equipamento dessa reserva, e faz um vlinha que vai ser o html que vai ser levado no js, cria a lista com o equipamento as datas e os botoes, se o html fica vazio vai  ser porque não tem reserva  */
procedure p_minhas_reservas:
    def var vcodigous   as int.
    def var vhtml       as longchar.
    def var vlinha      as longchar.

    assign vcodigous = int(get-value("vcodigo_usu")) no-error.

    for each reservaEquipa no-lock where 
    reservaEquipa.vcodigo_usu = vcodigous and reservaEquipa.vstatus = "Reservado":
        
        find first equipamento no-lock where 
             equipamento.codigo = reservaEquipa.vcodigo_equipa no-error.

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

//! ------------------- CANCELAR RESERVA -------------------
/* resumo: pega o id da reserva, encontra reserva que código = id, se nao tiver manda uma mensagem de false que verifico no js para dizer que deu erro, encontro o equipamento que tiver esse código de reserva e adiciono no status da reserva como cancelado e do equipamento como disponível e envio a mensagem true que deu certo */
procedure p_cancelar_reserva:
    def var vid as int.

    assign vid = int(get-value("vcodigo_reserva")) no-error.

    find first reservaEquipa exclusive-lock where 
         reservaEquipa.vcodigo_reserva = vid no-error.

    if not avail reservaEquipa 
    then do:
        fput('~{"msg":false~}').
        quit.
    end.

    find first equipamento exclusive-lock where 
         equipamento.codigo = reservaEquipa.vcodigo_equipa no-error.

    assign
        reservaEquipa.vstatus = "Cancelado"
    .

    if avail equipamento then
        assign equipamento.vstatus = "Disponível"
    .

    fput('~{"msg":true~}').
end procedure.

//! ------------------- CRIAR RESERVA -------------------
/* resumo:pega código do equipamento selecionado no select, converte as datas para o formato certo date, verifica se tem equipamento, verifica datas no passado ou invalida, depois verifica conflito de reservas igual o alterar, pega todas as reservas do equipamento, e se os periodos se sobrepoe, se sim retorna esse conflito, senao faz os creates, se a data inicio for menor ou igual hoje fica como reservado,senao disponivel */
//?ponto importante: na tabela so mostra como reservado reservas criadas a partir de hoje, então se fizer uma reserva futura continua como disponível
procedure p_criar_reserva:
    def var vultimo      as int init 0.
    def var vcodigo_eq   as int.
    def var vdataInicio  as date.
    def var vdataFinal   as date.
    def var vConflito    as log init false.

    assign vcodigo_eq   = int(get-value("vcodigo_equipa")) no-error.
    assign  vdataInicio = date(int(get-value("di_mes")), int(get-value("di_dia")), int(get-value("di_ano"))).
    assign  vdataFinal  = date(int(get-value("df_mes")), int(get-value("df_dia")), int(get-value("df_ano"))).

    find first equipamento exclusive-lock where 
         equipamento.codigo = vcodigo_eq no-error.

    if not avail equipamento 
    then do:
        fput('~{"msg":false~}').
        quit.
    end.

    if vdataInicio < today or vdataFinal <= vdataInicio 
    then do:
        fput('~{"msg":false~}').
        quit.
    end.

    for each reservaEquipa no-lock where 
        reservaEquipa.vcodigo_equipa = vcodigo_eq  and reservaEquipa.vstatus = "Reservado":
    
        if vdataInicio <= reservaEquipa.data_final and vdataFinal  >= reservaEquipa.data_inicio 
        then do:
            vConflito = true.
            leave.
        end.
    end.
    
    if vConflito 
    then do:
        fput('~{"msg":"mesmo periodo reserva"}').
        return.
    end.

    for last reservaEquipa no-lock by reservaEquipa.vcodigo_reserva:
        vultimo = reservaEquipa.vcodigo_reserva.
    end.

    create reservaEquipa.
    assign
        reservaEquipa.vcodigo_reserva = vultimo + 1
        reservaEquipa.vcodigo_equipa  = vcodigo_eq
        reservaEquipa.vcodigo_usu     = int(get-value("vcodigo_usu"))
        reservaEquipa.data_inicio     = vdataInicio
        reservaEquipa.data_final      = vdataFinal
        reservaEquipa.motivo          = url-decode(get-value("motivo"))
        reservaEquipa.vstatus         = "Reservado"
    .

    if vdataInicio <= today then
        equipamento.vstatus = "Reservado".
    else
        equipamento.vstatus = "Disponível".

    fput('~{"msg":true~}').
    quit.
end procedure.

//! ------------------- ALTERAR STATUS -------------------
/*resumo: pega o status novo e o código do equipamento, verifica se tem equipamento para aquele codigo, senao retorna falso, se achar reserva pro equipamento, e se tiver já reservas futuras para o equipamento envia isso e sai já que não acho interessante cancelar reservas mesmo se for para manutenção/inativo so pode alterar isso se ficar disponivel, se as reservas vencer fica disponivel pode alterar  */
procedure p_alterar_status:
    def var vcodigo_eq   as int.
    def var vnovo_status as char.
    
    assign vnovo_status = url-decode(get-value("vstatus")).
    assign vcodigo_eq   = int(get-value("vcodigo_equipa")) no-error.

    find first equipamento exclusive-lock where 
    equipamento.codigo = vcodigo_eq no-error.

    if not avail equipamento 
    then do:
        fput('~{"msg":false~}').
        quit.
    end.

    find first reservaEquipa no-lock where 
    reservaEquipa.vcodigo_equipa = vcodigo_eq and reservaEquipa.vstatus = "Reservado" and reservaEquipa.data_inicio > today no-error.

    if avail reservaEquipa 
    then do:
        fput('~{"msg":"futuras reservas"~}').
        quit.
    end.

    assign equipamento.vstatus = vnovo_status.

    if vnovo_status = "Disponível" 
    then do:
        for each reservaEquipa exclusive-lock where 
            reservaEquipa.vcodigo_equipa = vcodigo_eq and reservaEquipa.vstatus = "Reservado" and reservaEquipa.data_final < today:
                reservaEquipa.vstatus = "Disponível".
        end.
    end.

    fput('~{"msg":true~}').
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
