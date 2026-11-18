import profile from "../../data/profile/index";


export function getProfile(){
    
    return new Response(
        JSON.stringify({success: true,data: profile}),
        {
            status: 200,
            statusText: "OK",
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
}

export function getExperience(){

}

export function getProjects(){

}

export function getSkills(){

}