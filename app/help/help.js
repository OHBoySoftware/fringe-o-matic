angular.module('fringeApp').component('help', {
    templateUrl: 'app/help/help.html',
    controller: ['$scope', 'UserData', function ($scope, UserData) {
        $scope.userData = UserData.export();

        $scope.import = function(data) {
            data.settings = data.settings || {};
            data.settings.displaySchedulerStats = true;
            data.settings.scheduleMode = true;
            UserData.import(JSON.stringify(data));
            $scope.userData = UserData.export();
        };

        $scope.testData = {
            'New User': {},
            'Preferences': {
                preferences: {"1":1,"2":4,"4":2,"6":3,"7":4,"8":4,"9":2,"10":3,"12":4,"15":4,"22":3,"27":1,"28":2,"29":3,"32":3,"33":2,"34":1,"35":2,"41":2,"46":4,"47":3,"50":4,"51":3,"54":3,"63":2,"68":2,"70":3,"71":1,"72":1,"73":4,"74":4,"77":2,"80":1,"82":2,"83":3,"84":4,"86":4,"87":3,"90":4,"98":1,"99":3,"100":2,"102":2,"103":3,"104":2,"105":3,"106":4,"107":1,"111":2,"112":4,"114":2,"117":4,"119":4,"122":4,"123":1,"126":3,"127":2,"128":4,"129":3,"130":4,"131":3,"138":3,"140":1,"142":1,"146":2,"149":1,"151":1,"153":2,"155":4,"159":1,"186":4}
            },
            'Availability': {},
            'Schedule': {
                schedule: ["715","549","515","817","923","531","451","932"]
            },
            'Preferences and Schedule': {
                preferences: {"1":1,"2":4,"4":2,"6":3,"7":4,"8":4,"9":2,"10":3,"12":4,"15":4,"22":3,"27":1,"28":2,"29":3,"32":3,"33":2,"34":1,"35":2,"41":2,"46":4,"47":3,"50":4,"51":3,"54":3,"63":2,"68":2,"70":3,"71":1,"72":1,"73":4,"74":4,"77":2,"80":1,"82":2,"83":3,"84":4,"86":4,"87":3,"90":4,"98":1,"99":3,"100":2,"102":2,"103":3,"104":2,"105":3,"106":4,"107":1,"111":2,"112":4,"114":2,"117":4,"119":4,"122":4,"123":1,"126":3,"127":2,"128":4,"129":3,"130":4,"131":3,"138":3,"140":1,"142":1,"146":2,"149":1,"151":1,"153":2,"155":4,"159":1,"186":4},
                schedule: ["715","549","515","817","923","531","451","932"]
            },
            'Preferences and Schedule (Full)': {
                preferences: {"1":1,"2":4,"4":2,"6":3,"7":4,"8":4,"9":2,"10":3,"12":4,"15":4,"22":3,"27":1,"28":2,"29":3,"32":3,"33":2,"34":1,"35":2,"41":2,"46":4,"47":3,"50":4,"51":3,"54":3,"63":2,"68":2,"70":3,"71":1,"72":1,"73":4,"74":4,"77":2,"80":1,"82":2,"83":3,"84":4,"86":4,"87":3,"90":4,"98":1,"99":3,"100":2,"102":2,"103":3,"104":2,"105":3,"106":4,"107":1,"111":2,"112":4,"114":2,"117":4,"119":4,"122":4,"123":1,"126":3,"127":2,"128":4,"129":3,"130":4,"131":3,"138":3,"140":1,"142":1,"146":2,"149":1,"151":1,"153":2,"155":4,"159":1,"186":4},
                schedule: ["1","2","3","55","187","211","245","291","438","465","549","594","705","745","811","419","795","265","883","378","901","824","817","31","260","489","898","639","727","756","664","113","808","534","916","183","43","501","156","657","19","195","923","508","74","683","785","515","852","864","875","778","288","715","40","635","678","672","235","927","316","165","531","28","653","430","145","412","330","437","805","451","932"]
            }
        };
    }]
});
