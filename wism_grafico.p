{webpro.i}
{wpadfunc.i}
{wpadgraf.i}

procedure output-header:
end procedure.

procedure p_load:
   def var vgantt as class GPadGantt.
   def var i      as int.

    assign i = 0.
    assign vgantt = new GPadGantt("days"). 
    vgantt:setScale("*").

    def var vcodigo as int no-undo.

    assign vcodigo = int(get-value("vcodigo_equipa")) no-error.

    for each reservaEquipa no-lock
        where reservaEquipa.vstatus <> "Cancelado"
        and (vcodigo = 0 or reservaEquipa.vcodigo_equipa = vcodigo):

        find first equipamento no-lock
            where equipamento.codigo = reservaEquipa.vcodigo_equipa no-error.

        find first usuarioEquipa no-lock
            where usuarioEquipa.vcodigo = reservaEquipa.vcodigo_usu no-error.

        assign i = i + 1.

        vgantt:setBkgColor("rgb(130 181 220)").
        vgantt:setFntColor("white").

        vgantt:setData(
            reservaEquipa.vcodigo_equipa,
            equipamento.vnome,
            usuarioEquipa.vnome,
            reservaEquipa.data_inicio,
            reservaEquipa.data_final
        ).

        vgantt:setHourStart(0).
        vgantt:setHourEnd(0).

        vgantt:setHint(
            "Equipamento: " + (if avail equipamento then equipamento.vnome else "--") + "<br>" +
            "Usuário: "     + (if avail usuarioEquipa then usuarioEquipa.vnome else "--") + "<br>" +
            "Setor: "       + (if avail usuarioEquipa then usuarioEquipa.setor else "--") + "<br>" +
            "Motivo: "      + reservaEquipa.motivo + "<br>" +
            "Início: "      + string(reservaEquipa.data_inicio, "99/99/9999") + "<br>" +
            "Fim: "         + string(reservaEquipa.data_final,  "99/99/9999")
        ).
    end.

if i > 0 then do:
    vpad-grafico:add(vgantt).
    vpad-grafico:show().
end.

else do:
    {&out} "<div style='padding: 24px; text-align: center; color: #999; font-style: italic; font-size: 24px;position: relative;top: 35%;'>Nenhuma reserva encontrada para este equipamento!</div>".
end.

end procedure.
