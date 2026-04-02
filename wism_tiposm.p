{webpro.i}
{wpadma05.i}

function ftipos returns char() forwards.

procedure output-header:
    flista("add","vpad-modo",if get-value("vmodo-param") = "" then "MAN" else get-value("vmodo-param")).
end procedure.

procedure p_setvalue:
    if get-value("vpad-modo") = "MAN" then 
        find first tipoEquipa where tipoEquipa.vnometipo = get-value("vtipo-nome") no-lock no-error.
end procedure.

procedure p_insere_botao:
    def output parameter vadd-botao as char.
    
    if get-value("vpad-modo") = "MAN" then
        assign vadd-botao = fbotao_input("Sair","vbt-sair","Sair","").
    
    if get-value("vpad-modo") <> "MAN" then
        assign vadd-botao = fbotao_input("Voltar Consulta","vbt-volt","Voltar","") +
                            fbotao_input("Sair","vbt-sair","Sair","").
end procedure.

procedure p_botao_action:
    frunprog("vbt-volt","p_voltar","").
    frunprog("vbt-sair","p_sair","").
end procedure.

procedure p_setparams:
    assign vpad-titulo = if get-value("vpad-modo") = "MAN" then "Manutenção" else "Inclusão"        
    vpad-numcol = 2
    vpad-btret = ""
    vpad-btinc = ""
    vpad-progco = "wism_tiposm"
    vpad-btsal = if get-value("vpad-modo") <> "MAN" then "true" else "false"
    vpad-btexc = if get-value("vpad-modo") = "MAN" then "true" else "false".
end procedure.

procedure p_setinitial:
    {&out}
        fbranco(2, vpad-numcol)
        flabel("Nome do tipo:", "Center", 2, yes, yes, 0, yes, yes)
        fpad-text("vnometipo", 40, 100, 
                  if avail tipoEquipa then tipoEquipa.vnometipo else "",
                  "C", no, "center", 2, yes, yes, 0, yes, yes, "", "").
end procedure.

procedure p_mostra:
    if not can-find(first tipoEquipa where tipoEquipa.vnometipo <> "" and tipoEquipa.vnometipo <> ?) then do:
        {wpaderro.i "erro" "'Nenhum tipo encontrado'"}
        return.
    end.

    {&out} 
        fbranco(2, vpad-numcol)
        flabel("Selecione para Excluir:", "Center", 2, yes, yes, 0, yes, yes)
        fselect("vtipo-nome", ftipos(), get-value("vtipo-nome"), 1, no, no, "center", 2, yes, yes, 0, yes, yes, "").
end procedure.

procedure p_grava:
    def var v_nome as char.
    assign v_nome = trim(get-value("vnometipo")).

    if v_nome = "" 
    then do:
        {wpaderro.i "erro" "'Nome do Tipo deve ser informado'"}
    end.

    if get-value("vpad-modo") = "MAN" then 
        find first tipoEquipa where tipoEquipa.vnometipo = get-value("vtipo-nome") exclusive-lock no-error.
    else 
        find first tipoEquipa where tipoEquipa.vnometipo = "" exclusive-lock no-error.
    
    if avail tipoEquipa 
    then do:
        assign tipoEquipa.vnometipo = v_nome.
    end.

    flocation("","wism_tiposm","").
end procedure.

procedure p_criareg:
    def var vcodigo as int.
    
    if get-value("vmodo-param") <> "MAN" 
    then do:
        find last tipoEquipa no-lock no-error.
        assign vcodigo = 
        if avail tipoEquipa 
        then tipoEquipa.vcodigo + 1 
        else 1.
        
        create tipoEquipa.
        assign tipoEquipa.vcodigo   = vcodigo
               tipoEquipa.vnometipo = ""
        .
    end.
end procedure.

procedure p_excluir:
    def var vnome_del as char.

    assign vnome_del = get-value("vtipo-nome").

    if vnome_del <> "" 
    then do:
        find first tipoEquipa where 
        tipoEquipa.vnometipo = vnome_del exclusive-lock no-error.
        if avail tipoEquipa 
        then delete tipoEquipa.
    end.
    
    flocation("","wism_tiposm","").
end procedure.

procedure p_sair:
    flocation("","wism_projeto","").
end procedure.

procedure p_voltar:
    flocation("","wism_tiposm","vmodo-param=MAN").    
end procedure.

function ftipos returns char():
    def var vlist as char no-undo.
    assign vlist = ",-- Selecione --".
    for each tipoEquipa no-lock where tipoEquipa.vnometipo <> "" by tipoEquipa.vcodigo:
        assign vlist = vlist + "," + tipoEquipa.vnometipo + "," + tipoEquipa.vnometipo.
    end.
    return vlist.
end function.
