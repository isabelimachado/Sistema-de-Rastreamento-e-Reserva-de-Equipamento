{webpro.i}
{wpadma05.i}

def var vhidden as log no-undo.

procedure output-header:
    flista("add","vpad-modo",if get-value("vmodo-param") = "" then "MAN" else get-value("vmodo-param")).
end procedure.

procedure p_setvalue:
    if get-value("vpad-modo") = "MAN" then 
        find first tipoEquipa no-lock no-error.
end procedure.

procedure p_setparams:
    assign vpad-titulo = if get-value("vpad-modo") = "MAN" then "Manutenção" else "Inclusão"        
    vpad-numcol = 2
    vpad-btret = ""
    vpad-btinc = ""
    vpad-progco = "wism_tiposm"
    vpad-btsal = if get-value("vpad-modo") <> "MAN" then "true" else "false"
    vpad-btexc = if get-value("vpad-modo") = "MAN" and avail tipoEquipa then "true" else "false".
end procedure.

procedure p_setinitial:
    assign vhidden = logical(get-value("vhidden-initial") <> "").

    {&out}
        fbranco(2,vpad-numcol)
        flabel("Nome do Tipo:", "Center", 2, yes, yes, 0, yes, yes)

        "<tr align='center'><td colspan='2' style='padding-top: 20px;'>" 
            "<input type='text' name='vnometipo' " 
            "style='width: 400px; height: 30px; font-size: 13px; border-radius: 4px; border: 1px solid #ccc;' " 
            "value='" (if avail tipoEquipa and not vhidden then tipoEquipa.vnometipo else "") "'>" 
        "</td></tr>" 
        
        fhidden("vhidden-initial","vhidden-initial").
end procedure.

procedure p_mostra:
    if not can-find(first tipoEquipa where tipoEquipa.vnometipo <> "" and tipoEquipa.vnometipo <> ?) then do:
        {&out} 
        "<div style='padding: 24px; text-align: center; color: #999; font-style: italic; font-size: 18px;'>Nenhum tipo encontrado!</div>".
        return.
    end.

    {&out} 
        fbranco(2,vpad-numcol)
        flabel("Selecione para Excluir:", "Center", 2, yes, yes, 0, yes, yes)

        "<tr align='center'><td colspan='2' style='padding-top: 20px;'>" 
            "<select name='vtipo-nome' " 
            "style='width: 400px; height: 30px; font-size: 13px; border-radius: 4px; border: 1px solid #ccc;'>" 
            "<option value=''>-- Selecione --</option>".

    for each tipoEquipa no-lock where tipoEquipa.vnometipo <> "" by tipoEquipa.vnometipo:
        {&out} substitute("<option value='&1'>&1</option>", tipoEquipa.vnometipo).
    end.

    {&out} 
        "</select>" 
        "</td></tr>" .
end procedure.


procedure p_grava:
    def var v_nome as char no-undo.
    assign v_nome = trim(get-value("vnometipo")).

    if v_nome = "" then do:
        if get-value("vpad-modo") <> "MAN" and avail tipoEquipa then delete tipoEquipa.
        {wpaderro.i "erro" "'Nome do Tipo deve ser informado'"}
        return.
    end.

    if get-value("vpad-modo") = "MAN" then 
        find first tipoEquipa where tipoEquipa.vnometipo = get-value("vtipo-nome") exclusive-lock no-error.
    
    if avail tipoEquipa then do:
        assign tipoEquipa.vnometipo = v_nome.
    end.

    flocation("","wism_tiposm","vmodo-param=MAN&vtipo-nome=").
end procedure.

procedure p_criareg:
    def var vcodigo as int no-undo.
    find last tipoEquipa no-lock no-error.
    vcodigo = (
        if avail tipoEquipa then tipoEquipa.vcodigo + 1 else 1
    ).
    
    create tipoEquipa.
    assign tipoEquipa.vcodigo = vcodigo
           tipoEquipa.vnometipo = "".
end procedure.

procedure p_excluir:
    def var vnome_del as char no-undo.
    assign vnome_del = get-value("vtipo-nome").

    if vnome_del <> "" then do transaction:
        find first tipoEquipa where tipoEquipa.vnometipo = vnome_del exclusive-lock no-error.
        if avail tipoEquipa then delete tipoEquipa.
    end.
    
    flocation("","wism_tiposm","vmodo-param=MAN&vtipo-nome=").
end procedure.

procedure p_voltar:
    flocation("","wism_tiposm","").    
end procedure.

procedure p_botao_action:
    frunprog("vbt-volt","p_voltar","").
end procedure.

procedure p_insere_botao:
    def output parameter vadd-botao as char.
    if get-value("vpad-modo") <> "MAN" then
        assign vadd-botao = fbotao_input("Voltar Consulta","vbt-volt","Voltar","").
end procedure.
