<?php
    function setHistorial($id_usuario , $accion , $con){
        if ( !empty($id_usuario) && !empty($accion) ) {
            $strQuery = "INSERT INTO historial (id_usuario , accion)
                         VALUES( {$id_usuario} , '{$accion}' )";
            if ( mysqli_query($con, $strQuery) ) {
                return true;
            }
        }
        return false;
    }
?>