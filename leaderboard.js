PlayersList = new Mongo.Collection('PlayersList');

if(Meteor.isClient){
    Meteor.subscribe('players');

    Template.leaderboard.helpers({
        'player': function(){
            var currentUserId = Meteor.userId();
            return PlayersList.find({}, {sort: {score: -1, name: 1} });
        },
        'selected': function () {
            var playerId = this._id;
            var selectedPLayer = Session.get('selectedPlayer');
            if(playerId == selectedPLayer){
                return "selected";
            }
        },
        'showSelectedPlayer': function () {
            var selectedPlayer = Session.get('selectedPlayer');
            return PlayersList.findOne(selectedPlayer);
        }
    });

    Template.leaderboard.events({
        'click .player': function () {
            var playerId = this._id;
            Session.set('selectedPlayer', playerId);
        },
        'click .increment': function () {
            var selectedPlayer = Session.get('selectedPlayer');
            var points = 1;
            Meteor.call("updatePlayer", selectedPlayer, points);
        },
        'click .decrement': function () {
            var selectedPlayer = Session.get('selectedPlayer');
            var points = -1;
            Meteor.call("updatePlayer", selectedPlayer, points);
        }
    });
    Template.addPlayerForm.events({
        'submit form': function () {
            event.preventDefault();
            var playerName = event.target.playerName.value;
            var playerScore = event.target.playerScore.value;

            Meteor.call("newPlayer", playerName, playerScore);

            event.target.playerName.value = "";
            event.target.playerScore.value = "";
            return false;
        },
        'click .removePlayer': function () {
            var selectedPlayer = Session.get('selectedPlayer');
            Meteor.call("removePlayer", selectedPlayer);
        }
    });
}

if(Meteor.isServer){
    Meteor.publish('players', function () {
        return PlayersList.find({createdBy: this.userId });
    });
}

Meteor.methods({
    newPlayer: function (playerName, playerScore) {
        if (! Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        PlayersList.insert({
            name: playerName,
            score: parseInt(playerScore),
            createdBy: Meteor.userId()
        });
    },
    removePlayer: function (selectedPlayer) {
        PlayersList.remove(selectedPlayer);
    },
    updatePlayer: function (selectedPlayer, points) {
        PlayersList.update(selectedPlayer, {$inc: {score: points} });
    }
});