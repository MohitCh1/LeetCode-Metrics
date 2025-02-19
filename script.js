//this means when dom content get loaded completely then only it will use the function 
document.addEventListener("DOMContentLoaded",function(){
    const searchButton=document.getElementById("search-btn");
    const usernameInput=document.getElementById("user-input");
    const statsContainer=document.querySelector(".stats-container");
    const easyProgressCircle=document.querySelector(".easy-progress");
    const mediumProgressCircle=document.querySelector(".medium-progress");
    const hardProgressCircle=document.querySelector(".hard-progress");
    const easyLabel=document.getElementById("easy-label");
    const mediumLabel=document.getElementById("medium-label");
    const hardLabel=document.getElementById("hard-label");
    const cardStatsContainer=document.querySelector(".stats-card");
    

    function validateUsername(username){
        if(username.trim()===""){
            alert("Username shouldnot be empty");
            return false;
        }
        const pattern=/^[a-zA-Z0-9_-]{1,30}$/;
        const isMatching=pattern.test(username);
        if(!isMatching){
            alert("Invalid Username");
        }
        return isMatching;
         
         
    }

    async function fetchUserDetails(username){
        try{
          searchButton.textContent="Searching...";
          searchButton.disabled=true;
           //since we get a cors error in it so we will create a proxy server which is used to send request to leetcode and leetcode will fulfill it
        //it is a hack which is used when a server is not responding to the request so we will create a orixy server for that particular request.
          //since our real server is not working so we use this proxy server but we not need it if it run correctly
          const proxyUrl='https://cors-anywhere.herokuapp.com/';
          const targetUrl='https://leetcode.com/graphql/';

          const myHeaders = new Headers();
          myHeaders.append("content-type", "application/json");
  
          const graphql = JSON.stringify({
              query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
              variables: { "username": `${username}` }
          })
          const requestOptions = {
              method: "POST",
              headers: myHeaders,
              body: graphql,
          };
          //first it will request to proxyurl then to target url
          //concatenated url: https://cors-anywhere.herokuapp.com/https://leetcode.com/graphql
          //here this concatenated url will go to demo server where it will first execute proxyurl and then the next url will go in next after completing this proxy url
          const response = await fetch(proxyUrl+targetUrl, requestOptions);
        //   const response=await fetch(url);
          if(!response.ok){
             throw new Error("Unable to fetch the user details");
          }
          const parseddata= await response.json();
          console.log("login data:",parseddata);
          //now we receive data in our console and we want to populate the data in our ui
          displayUserData(parseddata);
          
          
       }

       catch(error){
           statsContainer.innerHTML= `<p>${error.message}</p>`;
       }

       finally{
        searchButton.textContent="Search";
        searchButton.disabled=false;
       }

    }

    function updateProg(solved,total,label,circle){
        const progressPercent=(solved/total)*100;
        circle.style.setProperty("--progress-degree",`${progressPercent}%`);
        label.textContent=`${solved}/${total}`;

    }

    function displayUserData(val){
        //these are data which we get from when we click in button for a particular id
        //console->click search->console->network->search ->grapgql->response ->here you will get json file for easy medium and hard question
        //copy it and use json formatter to format it and make it more easy to understand
        //in this you will get all the objects and array so you will go to place where you want to go.those which are in bracket are array
        //these array is accesed by there index 0 ,1,2, etc.... so here no is index.
        //the json for this is saved by name response json , we can see the respnse in it.
        const totalQues=val.data.allQuestionsCount[0].count;
        const totalEasyQues=val.data.allQuestionsCount[1].count;
        const totalMediumQues=val.data.allQuestionsCount[2].count;
        const totalHardQues=val.data.allQuestionsCount[3].count;

        const solvedTotalQues=val.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedTotalEasyQues=val.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedTotalMediumQues=val.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedTotalHardQues=val.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProg(solvedTotalEasyQues,totalEasyQues,easyLabel,easyProgressCircle);
        updateProg(solvedTotalMediumQues,totalMediumQues,mediumLabel,mediumProgressCircle);
        updateProg(solvedTotalHardQues,totalHardQues,hardLabel,hardProgressCircle);
        const cardsData = [
            {label: "Overall Submissions", value:val.data.matchedUser.submitStats.totalSubmissionNum[0].submissions },
            {label: "Overall Easy Submissions", value:val.data.matchedUser.submitStats.totalSubmissionNum[1].submissions },
            {label: "Overall Medium Submissions", value:val.data.matchedUser.submitStats.totalSubmissionNum[2].submissions },
            {label: "Overall Hard Submissions", value:val.data.matchedUser.submitStats.totalSubmissionNum[3].submissions },
        ];

        console.log("card ka data: " , cardsData);

        cardStatsContainer.innerHTML = cardsData.map(
            data => 
                    `<div class="card">
                    <h4>${data.label}</h4>
                    <p>${data.value}</p>
                    </div>`
        ).join("")
         

        

    }

    searchButton.addEventListener('click',function(){
        const username=usernameInput.value;
        if(validateUsername(username)){
              fetchUserDetails(username);
        }
        
        

    })
})
