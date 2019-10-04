module.exports = (express) => {
    let Router = express.Router();
    let limits = [{
        name : "Food & Drinks",
        amount : 400,
        current : 320
    },{
        name : "Travel",
        amount : 650,
        current : 690
    }]
    let goals = [{
        id: "123456",
        title: "Marriage",
        icon: "fa fa-heart",
        target: 20000,
        fulfilled: 4000,
        monthlyAdd: 1500,
        transactions: 24,
        due: "10/10/2020",
        warn: 23,
        priority: 2,
        transactionsArr: [{
            name: "Aug Savings",
            amount: 1500
        }, {
            name: "Exceeding Entertainment Limit (Aug)",
            amount: -120,
            message: "Pushed the event by 3 day"
        }, {
            name: "Sept Savings",
            amount: 1500
        }]
    }, {
        id: "123457",
        title: "Car",
        icon: "fa fa-car",
        target: 34000,
        fulfilled: 23000,
        monthlyAdd: 1220,
        transactions: 103,
        warn: 0,
        due: "3/11/2020",
        priority: 1,
        transactionsArr: [{
            name: "Aug Savings",
            amount: 1220
        }, {
            name: "Exceeding Entertainment Limit (Aug)",
            amount: -50,
            message: "Pushed the event by 1 day"
        }, {
            name: "Sept Savings",
            amount: 1220
        }]
    }, {
        id: "123459",
        title: "Home",
        icon: "fa fa-home",
        target: 835000,
        fulfilled: 117000,
        monthlyAdd: 4500,
        transactions: 401,
        warn: 87,
        due: "10/11/2025",
        priority: 3,
        transactionsArr: [{
            name: "Aug Savings",
            amount: 4500
        }, {
            name: "Exceeding Entertainment Limit (Aug)",
            amount: -110,
            message: "Pushed the event by 9 day"
        }, {
            name: "Sep Savings",
            amount: 4500
        }]
    }]
    Router.get("/goals", (req, res, next) => {
        res.json(goals.sort((a, b) => a.priority - b.priority));
    })
    Router.get("/goals/:id", (req, res, next) => {
        let [obj] = goals.filter(e => e.id === req.params.id);
        res.json(obj);
    })
    Router.get("/limits", (req, res, next) => {
        res.json(limits.sort((a, b) => b.amount - a.amount));
    })

    Router.get("/transact", (req, res, next) => {
        let amount = req.query.amount || 0;
        amount = parseInt(amount);
        if (amount > 0) {
            let count = goals.length;
            let s = 0;
            for (let index = 1; index <= count; index++) {
                s += index;
            };
            s = amount / s;
            for (let index = 0; index < goals.length; index++) {
                let deduct = (goals[index]['priority'] * s)
                goals[index]['fulfilled'] = parseInt(goals[index]['fulfilled']) - parseInt(deduct);
                let dailyAdd = goals[index]['monthlyAdd'] / 30;
                goals[index]['warn'] = goals[index]['warn'] + parseInt(deduct / dailyAdd);
                goals[index]['transactions'] = goals[index]['transactions'] || 0;
                goals[index]['transactions'] = goals[index]['transactions'] + 1;
                goals[index]['transactionsArr'].push({
                    name: "Exceeding Travel Limit (Sept)",
                    amount: parseFloat(-1 * deduct).toFixed(2),
                    message: parseInt(deduct / dailyAdd) > 0 ? "Pushed Event by " + parseInt(deduct / dailyAdd) + " days" : ""
                });
            }
            res.json({
                result: "success"
            })
        } else {
            res.json({
                result: "success"
            })
        }
    })
    Router.get("/addsalary", (req, res, next) => {
        let amount = req.query.amount || 0;
        amount = parseInt(amount);
        for (let index = 0; index < goals.length; index++) {
            if (amount > goals[index]['monthlyAdd']) {
                let min = Math.min(parseInt(goals[index]['target']) - parseInt(goals[index]['fulfilled']), parseInt(goals[index]['monthlyAdd']));
                if (min > 0) {
                    goals[index]['fulfilled'] = (parseInt(goals[index]['fulfilled']) + min);
                }
            }
            amount = amount - goals[index]['monthlyAdd'];
        }
        res.json({
            result: "success"
        })
    })
    Router.get("/addsavings", (req, res, next) => {
        let amount = parseInt(req.query.amount || "0") || 1000;
        amount = parseInt(amount);
        if (amount > 0) {
            let count = goals.length;
            let s = 0;
            for (let index = 1; index <= count; index++) {
                s += index;
            };
            s = amount / s;
            for (let index = 0; index < goals.length; index++) {
                let add = ((count - goals[index]['priority'] + 1) * s);
                console.log(add, parseInt(goals[index]['target']), parseInt(goals[index]['fulfilled']))
                add = Math.min(parseInt(goals[index]['target']) - parseInt(goals[index]['fulfilled']), add);
                if (add > 0) {
                    goals[index]['fulfilled'] = parseInt(goals[index]['fulfilled']) + parseInt(add);
                    let dailyAdd = goals[index]['monthlyAdd'] / 30;
                    goals[index]['transactionsArr'] = goals[index]['transactionsArr'] || [];
                    goals[index]['warn'] = goals[index]['warn'] - parseInt(add / dailyAdd);
                    goals[index]['transactions'] = goals[index]['transactions'] || 0;
                    goals[index]['transactions'] = goals[index]['transactions'] + 1;
                    goals[index]['transactionsArr'].push({
                        name: "Savings from Food Limit (Sept)",
                        amount: parseFloat(add).toFixed(2),
                        message: parseInt(add / dailyAdd) > 0 ? "Saved " + parseInt(add / dailyAdd) + " days" : ""
                    });
                }
            }
            res.json({
                result: "success"
            })
        } else {
            res.json({
                result: "success"
            })
        }
    })

    return Router;
}