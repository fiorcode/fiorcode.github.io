import { ethers } from "ethers";
var buyOrApprove = 0;
var web3;
var address="Conectar";
var swapInstance;
var priceGold = 0;

init();
var isConnected = obtenerValorDeLocalStorage("SwapConected");
if(isConnected=="true"){
	connect();
}

async function init() {
    // inyectar proveedor a web3
    // instanciar contratos
    // leer precio P1
    web3 = new Web3(window.ethereum);
    swapInstance = new web3.eth.Contract(exchange_abi, exchange_address);
    updatePrice();
    // Convert from fixed-point (1e18) to human-readable string
    const price = new ethers.utils.formatUnits(priceGold, 18);

    // Optional: round or truncate to desired decimals
    const formattedPrice = parseFloat(price).toFixed(5);
    document.getElementById("swap-price").innerHTML = formattedPrice;
}

async function updatePrice() {
  priceGold = await swapInstance.methods.getPrice(silver_address, gold_address).call();
}

async function connect()
{
    await window.ethereum.request({"method": "eth_requestAccounts", "params": []});
    const account = await web3.eth.getAccounts();

    address = account[0];


    document.getElementById('account').innerHTML=address.toString().slice(0,6)+"...";

    await setBalanceGold();
    await setBalanceSilver();
    await allowance();

    if(buyOrApprove==0) {
      document.getElementById('swap-submit').innerHTML = "approve";
    }
}


async function handleSubmit() {
    const AmountToBuy = document.querySelector("#form > input.IHAVE").value;

    if(buyOrApprove!=0) {
      swapInstance.methods.swapExactTokensForTokens(
        Number(AmountToBuy), 
        1,
        [silver_address, gold_address],
        address,
        9999999999999999999
      ).send({from: address})
          .on('transactionHash', function(hash){
              showToast("transactionHash: "+hash, "orange");
          })
          .on('confirmation', function(confirmationNumber, receipt){
              console.log(confirmationNumber);
          })
          .on('receipt', async function(receipt){
              console.log(receipt);
              showToast("transaccion correcta", "green");
              await setBalanceGold();
              await setBalanceSilver();
          })      
    } else {
      silverInstance = new web3.eth.Contract(silver_abi, silver_address);
      silverInstance.methods.approve(exchange_address,AmountToBuy).send({from: address})
          .on('transactionHash', function(hash){
              showToast("transactionHash: "+hash, "orange");
          })
          .on('confirmation', function(confirmationNumber, receipt){
              console.log(confirmationNumber);
          })
          .on('receipt', async function(receipt){
              console.log(receipt);
              showToast("transaccion correcta", "green");
              await allowance();
              if(buyOrApprove==0) {
                document.getElementById('swap-submit').innerHTML = "Approve";
              } else {
                document.getElementById('swap-submit').innerHTML = "Swapp";
              }
          }) 
    }

}


async function setBalanceGold() {
  goldInstance = new web3.eth.Contract(gold_abi, gold_address);
  const balanceGold = await goldInstance.methods.balanceOf(address).call();
  document.getElementById("balanceGold").innerHTML = balanceGold;
}

async function setBalanceSilver() {
  silverInstance = new web3.eth.Contract(silver_abi, silver_address);
  const balanceSilver = await silverInstance.methods.balanceOf(address).call();
  document.getElementById("balanceSilver").innerHTML = balanceSilver;
}

async function allowance() {
  silverInstance = new web3.eth.Contract(silver_abi, silver_address);
  const allowed = await silverInstance.methods.allowance(address,exchange_address).call();
  buyOrApprove = allowed;
}




  /////////////////////////// Funciones comunes

function setValueTokenToSpend() {
	amount0 = document.getElementsByClassName("IHAVE")[0].value;
	amount0 = amount0 / 1;
	amount1 = amount0/P1 ;
	document.getElementsByClassName("IWANT")[0].value=amount1;
}

function showToast(address, color) {
	var toast = document.getElementById("toast");
	var addressLines = address.match(/.{1,20}/g); // Dividir la dirección en grupos de 6 caracteres
  
	toast.innerHTML = ""; // Limpiar el contenido del toast
  
	addressLines.forEach(function(line) {
	  var lineElement = document.createElement("div");
	  lineElement.textContent = line;
	  toast.appendChild(lineElement);
	});
  
	toast.style.backgroundColor = color;
	toast.classList.add("show");
	setTimeout(function(){
	  toast.classList.remove("show");
	}, 3000);
}

// Función para guardar un valor en localStorage
function guardarValorEnLocalStorage(key, valor) {
	localStorage.setItem(key, valor);
}
  
  // Función para obtener un valor de localStorage
function obtenerValorDeLocalStorage(key) {
	const valor = localStorage.getItem(key);
	return valor !== null ? valor : "DE";
}
