var options = {
    rand_seed: Helpers.randInt(100000)
};
var game = new Civvies(options);
game.log(true);

//For testing
$(function(){
    $('h1').on('click',function(){
        game._private_functions.test(game);
    })
});

function paneSelect(name){
	//Called when user switches between the various panes on the left hand side of the interface
	if (name == 'buildings'){
		document.getElementById("buildingsPane").style.display = "block";
		document.getElementById("upgradesPane").style.display = "none";
		document.getElementById("deityPane").style.display = "none";
		document.getElementById("conquestPane").style.display = "none";
		document.getElementById("tradePane").style.display = "none";
		document.getElementById("selectBuildings").className = "paneSelector selected";
		document.getElementById("selectUpgrades").className = "paneSelector";
		document.getElementById("selectDeity").className = "paneSelector";
		document.getElementById("selectConquest").className = "paneSelector";
		document.getElementById("selectTrade").className = "paneSelector";
	}
	if (name == 'upgrades'){
		document.getElementById("buildingsPane").style.display = "none";
		document.getElementById("upgradesPane").style.display = "block";
		document.getElementById("deityPane").style.display = "none";
		document.getElementById("conquestPane").style.display = "none";
		document.getElementById("tradePane").style.display = "none";
		document.getElementById("selectBuildings").className = "paneSelector";
		document.getElementById("selectUpgrades").className = "paneSelector selected";
		document.getElementById("selectDeity").className = "paneSelector";
		document.getElementById("selectConquest").className = "paneSelector";
		document.getElementById("selectTrade").className = "paneSelector";
	}
	if (name == 'deity'){
		document.getElementById("buildingsPane").style.display = "none";
		document.getElementById("upgradesPane").style.display = "none";
		document.getElementById("deityPane").style.display = "block";
		document.getElementById("conquestPane").style.display = "none";
		document.getElementById("tradePane").style.display = "none";
		document.getElementById("selectBuildings").className = "paneSelector";
		document.getElementById("selectUpgrades").className = "paneSelector";
		document.getElementById("selectDeity").className = "paneSelector selected";
		document.getElementById("selectConquest").className = "paneSelector";
		document.getElementById("selectTrade").className = "paneSelector";
	}
	if (name == 'conquest'){
		document.getElementById("buildingsPane").style.display = "none";
		document.getElementById("upgradesPane").style.display = "none";
		document.getElementById("deityPane").style.display = "none";
		document.getElementById("conquestPane").style.display = "block";
		document.getElementById("tradePane").style.display = "none";
		document.getElementById("selectBuildings").className = "paneSelector";
		document.getElementById("selectUpgrades").className = "paneSelector";
		document.getElementById("selectDeity").className = "paneSelector";
		document.getElementById("selectConquest").className = "paneSelector selected";
		document.getElementById("selectTrade").className = "paneSelector";
	}
	if (name == 'trade'){
		document.getElementById("buildingsPane").style.display = "none";
		document.getElementById("upgradesPane").style.display = "none";
		document.getElementById("deityPane").style.display = "none";
		document.getElementById("conquestPane").style.display = "none";
		document.getElementById("tradePane").style.display = "block";
		document.getElementById("selectBuildings").className = "paneSelector";
		document.getElementById("selectUpgrades").className = "paneSelector";
		document.getElementById("selectDeity").className = "paneSelector";
		document.getElementById("selectConquest").className = "paneSelector";
		document.getElementById("selectTrade").className = "paneSelector selected";
	}
}