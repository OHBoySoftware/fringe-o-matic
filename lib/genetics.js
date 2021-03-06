var Genetic = (function () {

    // facilitates communcation between web workers
    var Serialization = {
        "stringify": function (obj) {
            return JSON.stringify(obj, function (key, value) {
                if (value instanceof Function || typeof value === "function") return "__func__:" + value.toString();
                if (value instanceof RegExp) return "__regex__:" + value;
                return value;
            });
        }, "parse": function (str) {
            return JSON.parse(str, function (key, value) {
                if (typeof value !== "string") return value;
                if (value.lastIndexOf("__func__:", 0) === 0) return eval('(' + value.slice(9) + ')');
                if (value.lastIndexOf("__regex__:", 0) === 0) return eval('(' + value.slice(10) + ')');
                return value;
            });
        }
    };

    var Clone = function (obj) {
        if (obj === null || typeof obj !== "object") {
            return obj;

        }

        return JSON.parse(JSON.stringify(obj));
    };

    // var Optimize = {
    //     /**
    //      * @return {boolean}
    //      */
    //     Maximize: function (a, b) {
    //         return a >= b;
    //     },
    //     /**
    //      * @return {boolean}
    //      */
    //     Minimize: function (a, b) {
    //         return a < b;
    //     }
    // };

    // var Select1 = {
    //     "Tournament2": function (pop) {
    //         var n = pop.length,
    //             a = pop[Math.floor(Math.random() * n)],
    //             b = pop[Math.floor(Math.random() * n)];
    //
    //         return this.optimize(a.fitness, b.fitness) ? a.entity : b.entity;
    //     },
    //     "Tournament3": function (pop) {
    //         var n = pop.length,
    //             a = pop[Math.floor(Math.random() * n)],
    //             b = pop[Math.floor(Math.random() * n)],
    //             c = pop[Math.floor(Math.random() * n)],
    //             best = this.optimize(a.fitness, b.fitness) ? a : b;
    //         best = this.optimize(best.fitness, c.fitness) ? best : c;
    //         return best.entity;
    //     }, "Fittest": function (pop) {
    //         return pop[0].entity;
    //     }, "Random": function (pop) {
    //         return pop[Math.floor(Math.random() * pop.length)].entity;
    //     }, "RandomLinearRank": function (pop) {
    //         this.internalGenState["rlr"] = this.internalGenState["rlr"] || 0;
    //         return pop[Math.floor(Math.random() * Math.min(pop.length, (this.internalGenState["rlr"]++)))].entity;
    //     }, "Sequential": function (pop) {
    //         this.internalGenState["seq"] = this.internalGenState["seq"] || 0;
    //         return pop[(this.internalGenState["seq"]++) % pop.length].entity;
    //     }
    // };
    //
    // var Select2 = {
    //     "Tournament2": function (pop) {
    //         return [Select1.Tournament2.call(this, pop), Select1.Tournament2.call(this, pop)];
    //     }, "Tournament3": function (pop) {
    //         return [Select1.Tournament3.call(this, pop), Select1.Tournament3.call(this, pop)];
    //     }, "Random": function (pop) {
    //         return [Select1.Random.call(this, pop), Select1.Random.call(this, pop)];
    //     }, "RandomLinearRank": function (pop) {
    //         return [Select1.RandomLinearRank.call(this, pop), Select1.RandomLinearRank.call(this, pop)];
    //     }, "Sequential": function (pop) {
    //         return [Select1.Sequential.call(this, pop), Select1.Sequential.call(this, pop)];
    //     }, "FittestRandom": function (pop) {
    //         return [Select1.Fittest.call(this, pop), Select1.Random.call(this, pop)];
    //     }
    // };

    function Genetic() {

        // population
        this.fitness = null;
        this.seed = null;
        this.mutate = null;
        this.crossover = null;
        this.select1 = function (pop) {
            this.internalGenState["rlr"] = this.internalGenState["rlr"] || 0;

            return pop[Math.floor(Math.random() * Math.min(pop.length, (this.internalGenState["rlr"]++)))].entity;
        };
        this.select2 = function (pop) {
            return [this.select1(pop), this.select1(pop)];
        };

        this.optimize = function (a, b) {
            return a >= b;
        };
        this.generation = null;
        this.notification = null;

        this.configuration = {
            "size": 250,
            "crossover": 0.9,
            "mutation": 0.2,
            "iterations": 100,
            "fittestAlwaysSurvives": true,
            "maxResults": 1,
            "skip": 0
        };

        this.userData = {};
        this.internalGenState = {};
        this.entities = [];

        this.start = function start() {

            var i,
                self = this;

            function mutateOrNot(entity) {
                // applies mutation based on mutation probability
                return Math.random() <= self.configuration.mutation && self.mutate ? self.mutate(entity) : entity;
            }

            // seed the population
            for (i = 0; i < this.configuration.size; ++i) {
                this.entities.push(this.seed());
            }

            for (i = 0; i < this.configuration.iterations; ++i) {
                // reset for each generation
                this.internalGenState = {};

                // score and sort
                var pop = this.entities
                    .map(function map(entity) {
                        return {"fitness": self.fitness(entity), "entity": entity};
                    })
                    .sort(function sort(a, b) {
                        return self.optimize(a.fitness, b.fitness) ? -1 : 1;
                    });

                var stats = {
                    maximum: pop[0].fitness,
                    minimum: pop[pop.length - 1].fitness
                    // mean: mean,
                    // stdev: stdev
                };

                var r = this.generation ? this.generation(pop.slice(0, this.configuration['maxResults']), i, stats) : true;
                var isFinished = (typeof r !== "undefined" && !r) || (i === this.configuration.iterations - 1);

                if (
                    this.notification
                    && (isFinished || this.configuration["skip"] === 0 || i % this.configuration["skip"] == 0)
                ) {
                    this.sendNotification(pop.slice(0, this.configuration["maxResults"]), i, stats, isFinished);
                }

                if (isFinished)
                    break;

                // crossover and mutate
                var newPop = [];

                if (this.configuration.fittestAlwaysSurvives) // lets the best solution fall through
                    newPop.push(pop[0].entity);

                while (newPop.length < self.configuration.size) {
                    if (
                        this.crossover // if there is a crossover function
                        && Math.random() <= this.configuration.crossover // base crossover on specified probability
                        && newPop.length + 1 < self.configuration.size // keeps us from going 1 over the max population size
                    ) {
                        var parents = this.select2(pop);
                        var children = this.crossover(parents[0], parents[1]).map(mutateOrNot);
                        newPop.push(children[0], children[1]);
                    } else {
                        newPop.push(mutateOrNot(self.select1(pop)));
                    }
                }

                this.entities = newPop;
            }
        };

        this.sendNotification = function (pop, generation, stats, isFinished) {
            postMessage({
                "best": pop[0]
                , "generation": generation
                , "stats": stats
                , "isFinished": isFinished
            });
        };
    }

    Genetic.prototype.evolve = function (config, userData) {

        var k;
        for (k in config) {
            this.configuration[k] = config[k];
        }

        for (k in userData) {
            this.userData[k] = userData[k];
        }

        function addslashes(str) {
            return str.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
        }

        // bootstrap webworker script
        var blobScript = "var Serialization = {'stringify': " + Serialization.stringify.toString() + ", 'parse': " + Serialization.parse.toString() + "};\n";
        blobScript += "var Clone = " + Clone.toString() + ";\n";

        // make available in webworker
        // blobScript += "var Optimize = Serialization.parse(\"" + addslashes(Serialization.stringify(Optimize)) + "\");\n";
        // blobScript += "var Select1 = Serialization.parse(\"" + addslashes(Serialization.stringify(Select1)) + "\");\n";
        // blobScript += "var Select2 = Serialization.parse(\"" + addslashes(Serialization.stringify(Select2)) + "\");\n";

        // materialize our ga instance in the worker
        blobScript += "var genetic = Serialization.parse(\"" + addslashes(Serialization.stringify(this)) + "\");\n";
        blobScript += "onmessage = function(e) { genetic.start(); }\n";

        var self = this;

        var blob = new Blob([blobScript]);
        this.worker = new Worker(window.URL.createObjectURL(blob));
        this.worker.onmessage = function (e) {
            var response = e.data;
            self.notification(response.best, response.generation, response.stats, response.isFinished);
        };
        this.worker.postMessage("");
    };

    Genetic.prototype.stop = function() {
        this.worker.terminate();
    };

    return {
        "create": function () {
            return new Genetic();
        },
        // "Select1": Select1,
        // "Select2": Select2,
        // "Optimize": Optimize,
        "Clone": Clone
    };

})();