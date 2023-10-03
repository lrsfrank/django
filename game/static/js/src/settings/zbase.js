class Settings {
    constructor(root) {
        this.root = root;
        this.start();
    }
    start(){
        this.getinfo();
    }
    register() {
        
    }
    login() {
        
    }
    getinfo() {
        let outer = this;
        $.ajax({
            url: "http://8.134.174.213:8000/settings/getinfo/",
            type: "GET",
            data: {
            },
            success: function(reap) {
                console.log(reap);
                if (reap.result === "success") {
                    outer.root.menu.show();
                } else {
                    outer.login();
                }
            }
    })
    }
}
