<template>

    <div class="container-fluid m-0  p-0 pb-5">
        <div class="cover">
            <div class="cover-text">
                <h3>JOIN THE MOST <span class="orange-text">POWERFUL</span> PERSONAL INJURY PLATFORM <span
                        class="orange-text">ON THE PLANET!</span></h3>
            </div>
        </div>
        <div class="d-flex justify-content-center">
            <div class="text-center text-white">
                <h1 class="font-bold">Choose <span class="orange-text">Your</span> Plan</h1>
                <p>Switch plans or cancel anytime.</p>
            </div>
        </div>
        <div class="row px-4 pb-5">
            <div class="col-12 col-md-3 py-2">
                <Card class="p-3 text-center plan-card">
                    <template #header>
                        <h3 class="plan-card-h3">National Platform</h3>
                        <h1 class="m-0"><strong>$19</strong>/month</h1>
                    </template>
                    <template #content>
                        <ul class="plan-list">
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Unlimited Locations</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Digital Platform</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Appearance</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Powerful Ad Co-Op</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Smartapp Access</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Attorney, Provider Exchange</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Platform Search appearance</li>
                        </ul>
                    </template>
                    <template #footer>
                        <div class="flex gap-4 m-3 fixed-bottom">
                            <Button class="w-100 subs-button p-button-gradient" >Select Plan</Button>
                        </div>
                    </template>
                </Card>
            </div>
            <div class="col-12 col-md-3 py-2">
                <Card class="p-3 text-center plan-card">
                    <template #header>
                        <h3 class="plan-card-h3">Quarterly</h3>
                        <h1 class="m-0"><strong>$850</strong>/month</h1>
                    </template>
                    <template #content>
                        <ul class="plan-list">
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Up to 3 Locations</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Lead generation</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Auto Scheduling - 1st Appt</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Powerful Ad Co-Op</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Smartapp Access</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Preferred Referrals</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Market Exclusivity*</li>
                        </ul>
                    </template>
                    <template #footer>
                        <div class="flex gap-4 m-3 fixed-bottom">
                            <Button class="w-100 subs-button p-button-gradient" >Select Plan</Button>
                        </div>
                    </template>
                </Card>
            </div>
            <div class="col-12 col-md-3 py-2">
                <Card class="p-3 text-center plan-card">
                    <template #header>
                        <h3 class="plan-card-h3">6-Month</h3>
                        <h1 class="m-0"><strong>$700</strong>/month</h1>
                        <small>Save 17%</small>
                    </template>
                    <template #content>
                        <ul class="plan-list">
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Up to 3 Locations</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Lead generation</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Auto Scheduling - 1st Appt</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Powerful Ad Co-Op</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Smartapp Access</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Preferred Referrals</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Market Exclusivity*</li>
                        </ul>
                    </template>
                    <template #footer>
                        <div class="flex gap-4 m-3 fixed-bottom">
                            <Button class="w-100 subs-button d-inline p-button-gradient" >Select Plan</Button>
                        </div>
                    </template>
                </Card>
            </div>
            <div class="col-12 col-md-3 py-2">
                <Card class="p-3 text-center plan-card">
                    <template #header>
                        <h3 class="plan-card-h3">Annual</h3>
                        <h1 class="m-0"><strong>$700</strong>/month</h1>
                        <small>Save 25%</small>
                    </template>
                    <template #content>
                        <ul class="plan-list">
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Up to 4 Locations</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Lead generation</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Auto Scheduling - 1st Appt</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Powerful Ad Co-Op</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Smartapp Access</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Preferred Referrals</li>
                            <li><i class="fa-solid fa-circle-check fa-xl pe-2"></i>Market Exclusivity*</li>
                        </ul>
                    </template>
                    <template #footer>
                        <div class="flex gap-4 m-3 fixed-bottom">
                            <Button class="w-100 subs-button d-inline p-button-gradient" >Select Plan </Button>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
    </div>

</template>

<style scoped>
.container-fluid {
    height: auto !important;
    background-color: #303030;
}

.cover {

    background-image: url('../assets/img/map.webp') !important;
    background-size: cover;
    background-repeat: no-repeat;
    height: 300px;
    color: #fff !important;
    text-align: center;

}

.cover-text {
    position: absolute;
    background-color: rgba(36, 36, 36, 0.5) !important;
    backdrop-filter: blur(5px) !important;
    top: 15%;

}

.plan-card {
    background-color: rgba(36, 36, 36, 0.7) !important;
    backdrop-filter: blur(5px);
    color: #fff !important;
    border: 5px solid #f97316;
    border-radius: 30px;
    height: 500px;


}

h1{
    font-weight: 300;
    
}

.plan-card-h3 {
    font-weight: bold;
    font-family: "Fira Sans", sans-serif;
    color: #f97316;
    text-transform: uppercase;
}

.plan-list{
    text-align: left;
    list-style-type: none;
}
.plan-list > li {
    margin: 1rem 0;
}
.plan-list > li > .fa-solid {
    color: #f97316;
}

.subs-button {
    font-size: 1.5rem;
    font-weight: bold;
    font-family: "Fira Sans", sans-serif;
    line-height: 1.3rem;
}

br {}

small {
    font-size: .9rem;
    font-weight: 500;
    font-family: "Fira Sans", sans-serif;
}
</style>