var form = document.getElementById("titanic-form");
console.log("load")
form.onsubmit = async function (event) {
    event.preventDefault();
    event.stopPropagation();
    await calculateSurvival(event)
}

export default async function calculateSurvival(event) {
    const model = await tf.loadLayersModel('../output/model.json');
    event.preventDefault();

    const SexInput = document.getElementById("sex");
    const TitleInput = document.getElementById("title");
    const success = document.getElementById("success");
    const failure = document.getElementById("failure");

    success.classList.add('hidden');
    failure.classList.add('hidden');

    const PclassInput = document.getElementById("pclass");
    const SibSpInput = document.getElementById("sibsp");
    const ParchInput = document.getElementById("parch");

    const values = {
        "Pclass": PclassInput.value,
        "Sex": SexInput.value,
        "SibSp": SibSpInput.value,
        "Parch": ParchInput.value,
        "Title": TitleInput.value,
    }
    const locationParams = {
        "Pclass": {
            "mean": 2.26555,
            "standardDeviation": 0.841837
        },
        "Sex": {
            "mean": 0.363636,
            "standardDeviation": 0.481622
        },
        "SibSp": {
            "mean": 0.4473684,
            "standardDeviation": 0.8967595
        },
        "Parch": {
            "mean": 0.3923445,
            "standardDeviation": 0.9814288
        },
        "Title": {
            "mean": 3.7511961,
            "standardDeviation": 2.575537
        },
    }

    const getStandardScaledValue = function (attributeName) {
        return (values[attributeName] - locationParams[attributeName]["mean"])
            / locationParams[attributeName]["standardDeviation"];
    }

    let value = [
        getStandardScaledValue("Pclass"),
        getStandardScaledValue("Sex"),
        getStandardScaledValue("SibSp"),
        getStandardScaledValue("Parch"),
        getStandardScaledValue("Title")
    ]
    
    // @see https://stackoverflow.com/questions/61115020/creating-tensors-with-null-as-batch-dimension-in-tensorflow-js
    const tensor = tf.tensor(value, [1, 5])
    const prediction = model.predict(tensor);
    prediction.print()
    console.log((await prediction.data())[0])
    const predictedValue = (await prediction.data())[0];
    if (Math.round(predictedValue) === 1) {
        success.classList.remove('hidden')
        scrollToOffset(success);
    } else {
        failure.classList.remove('hidden')
        scrollToOffset(failure);
    }
    return false;
}

function scrollToOffset(element) {
    var elementPosition = element.getBoundingClientRect().top;
    var offsetPosition = elementPosition - 50;

    window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
    });
}
