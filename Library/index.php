<?php
$file= scandir("./");
$cumul=0;

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Création de quizz</title>
    <style>
        *{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Calibri;
        }
        .container{
            display: grid;
            grid-template-areas: 
            "head head"
            "list content"
            "footer footer";
        }
    </style>
</head>
<body>
    <div class="container">
        <head g_area="head">
            Gestion des quizz Local Only
        </head>
           <list g_area="list">
            <?php
            foreach($file as $f){
                if($f!=".." && $f!="." && $f!="stat.php" && $f!="simpson.json"&& $f!="reserve.json"&& $f!="test.json"){
                    $content=json_decode(file_get_contents($f),true);
                    $nb=count($content);
                    echo "<a href='stat.php?file=$f'>$f</a> => $nb questions <br>";
                    $cumul+=$nb;
                }
               }
            ?>
           </list>
           <content g_area="content">
            ici le contenu
           </content>
        <footer g_area="footer">
        Copyright &copy; Cecil Cordheley <?php echo date('Y'); ?>
        </footer>
    </div>
    <script>
        window.addEventListener("load",function(){
    document.querySelectorAll("[g_area]").forEach(el=>{
        el.style["grid-area"]=el.getAttribute("g_area");
      /*  var extractBtn=document.getElementById("ExecExtract");
        var ctrlExtact=document.getElementById("extractCtrl");
        extractBtn.style.display="none";
        ctrlExtact.style.display="none";*/
    });
});
    </script>
</body>
</html>