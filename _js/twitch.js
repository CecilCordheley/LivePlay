function getBadgeList(){
  fetch("async.php")
  .then((response)=>response.text())
  .then((result)=>{
    let r=JSON.parse(result);
    if(r.error==undefined){
    //  g=r.global
      state.badge=r.Channel;
    }
  });
}
function getFollow() {
  const informations = document.getElementById("nbFollow");
  const myHeaders = new Headers();
  myHeaders.append("Client-Id", "wb27474oevxe4alz4ffm3wcg26kef6");
  myHeaders.append("Authorization", "Bearer 0cirt4r8f4qskb1ox084aufta82qop");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  fetch("https://api.twitch.tv/helix/channels/followers?broadcaster_id=721260098", requestOptions)
    .then((response) => response.text())
    .then((result) => {
      // console.dir(JSON.parse(result));
      informations.innerHTML = "Votre chaine compte " + JSON.parse(result).total;
    })
    .catch((error) => console.error(error));
}
async function getViewerInformation(user, fnc,callbackArg={}) {
  const tokenUrl = "https://id.twitch.tv/oauth2/token";
  const clientId = "wb27474oevxe4alz4ffm3wcg26kef6";  // Assurez-vous de protéger ces valeurs sensibles.
  const clientSecret = "qeaxs2vognultk41g3p8h5dmvwwofy";
  const tokenRequestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
  };

  try {
    // Obtenir le token d'accès
    const tokenResponse = await fetch(tokenUrl, tokenRequestOptions);
    const tokenResult = await tokenResponse.json();
    const accessToken = tokenResult.access_token;

    if (accessToken) {
      const channelUrl = `https://api.twitch.tv/helix/users?login=${user}`;
      const channelRequestOptions = {
        method: "GET",
        headers: {
          "Client-Id": clientId,
          "Authorization": `Bearer ${accessToken}`
        }
      };

      // Obtenir les informations sur la chaîne
      const channelResponse = await fetch(channelUrl, channelRequestOptions);
      const channelData = await channelResponse.json(); // Conversion de la réponse en JSON
      
      if (channelData && channelData.data && channelData.data.length > 0) {
        fnc.call(this, channelData.data[0],callbackArg);  // Appel de la fonction callback avec les informations de l'utilisateur
      } else {
        console.error("Aucune information utilisateur trouvée.");
      }
    } else {
      console.error("Impossible d'obtenir le token.");
    }
  } catch (e) {
    console.error("Erreur lors de la récupération des informations :", e);
  }
}

async function getLiveInformation(broadCaster, off = true) {
  // URL et options pour la requête d'obtention du token
  const tokenUrl = "https://id.twitch.tv/oauth2/token";
  const clientId = "wb27474oevxe4alz4ffm3wcg26kef6";
  const clientSecret = "qeaxs2vognultk41g3p8h5dmvwwofy";
  const tokenRequestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
  };

  try {
    // Obtenir le token d'accès
    const tokenResponse = await fetch(tokenUrl, tokenRequestOptions);
    const tokenResult = await tokenResponse.json();
    const accessToken = tokenResult.access_token;

    if (accessToken) {
      if (!off) {
        // Options pour la requête d'informations sur la chaîne
        const channelUrl = `https://api.twitch.tv/helix/streams?user_login=${broadCaster}`;
        const channelRequestOptions = {
          method: "GET",
          headers: {
            "Client-Id": clientId,
            "Authorization": `Bearer ${accessToken}`
          }
        };

        // Obtenir les informations sur la chaîne
        const channelResponse = await fetch(channelUrl, channelRequestOptions);
        const channelResult = await channelResponse.json();
        console.log("Channel Result:", channelResult);

        if (channelResult.data && channelResult.data.length > 0) {
          return channelResult.data[0];
        } else {
          console.error("Broadcaster not found");

          getLiveInformation(broadCaster, true);
        }
      } else {
        const channelUrl = `https://api.twitch.tv/helix/users?login=${broadCaster}`;
        const channelRequestOptions = {
          method: "GET",
          headers: {
            "Client-Id": clientId,
            "Authorization": `Bearer ${accessToken}`
          }
        };

        // Obtenir les informations sur la chaîne
        const channelResponse = await fetch(channelUrl, channelRequestOptions);
        const channelResult = await channelResponse.json();
        console.log("Channel Result:", channelResult);
        if (channelResult.data && channelResult.data.length > 0) {
          const broadcasterId = channelResult.data[0].id;
          var countView = channelResult.data[0].view_count;
          //   console.log("Broadcaster ID:", broadcasterId);

          // URL et options pour récupérer les règles du chat
          const chatRulesUrl = `https://api.twitch.tv/helix/channels?broadcaster_id=${broadcasterId}`;
          const chatRulesRequestOptions = {
            method: "GET",
            headers: {
              "Client-Id": clientId,
              "Authorization": `Bearer ${accessToken}`
            }
          };

          // Obtenir les règles du chat
          const chatRulesResponse = await fetch(chatRulesUrl, chatRulesRequestOptions);
          const chatRulesResult = await chatRulesResponse.json();
          chatRulesResult.data[0]["nbView"] = countView;
          console.log("Chat Rules:", chatRulesResult.data);
          return chatRulesResult.data[0];
        } else {
          console.error("Broadcaster not found");
        }
      }
    } else {
      console.error("Failed to obtain access token");
    }

  } catch (error) {
    console.error(error);
  }

}
async function getFollowers(broadCaster) {
  const tokenUrl = "https://id.twitch.tv/oauth2/token";
  const clientId = "wb27474oevxe4alz4ffm3wcg26kef6";
  const clientSecret = "qeaxs2vognultk41g3p8h5dmvwwofy";

  try {
    // Étape 1 : Obtenir le token d'accès
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials&scope=moderator:read:followers`
    });
    const tokenResult = await tokenResponse.json();
    const accessToken = tokenResult.access_token;

    if (!accessToken) {
      console.error("Échec de l'obtention du token d'accès");
      return;
    }

    // Étape 2 : Obtenir l'ID du diffuseur
    const channelUrl = `https://api.twitch.tv/helix/users?login=${broadCaster}`;
    const channelRequestOptions = {
      method: "GET",
      headers: {
        "Client-Id": clientId,
        "Authorization": `Bearer ${accessToken}`
      }
    };

    const channelResponse = await fetch(channelUrl, channelRequestOptions);
    const channelResult = await channelResponse.json();

    if (!channelResult.data || channelResult.data.length === 0) {
      console.error("Diffuseur non trouvé");
      return;
    }

    const broadcasterId = channelResult.data[0].id;

    // Étape 3 : Obtenir la liste des followers
    const followersUrl = `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${broadcasterId}`;
    const followersRequestOptions = {
      method: "GET",
      headers: {
        "Client-Id": clientId,
        "Authorization": `Bearer ${accessToken}`
      }
    };

    const followersResponse = await fetch(followersUrl, followersRequestOptions);
    const followersResult = await followersResponse.json();

    if (followersResult.data) {
      console.log("Followers Data:", followersResult.data);
      return followersResult.data;
    } else {
      console.error("Aucun follower trouvé.");
      return [];
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}

