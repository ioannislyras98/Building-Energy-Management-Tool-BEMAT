import React,{ useState } from "react";
import UserList from './components/UserList';
import "./App.css";

function App() {
  return (
    <div class="px-6 text-gray-900 antialiased">
      <div class="mx-auto max-w-xl py-12 md:max-w-4xl">
        <h2 class="text-2xl font-bold">Εγγραφή νέου χρήστη</h2>
        <p class="mt-2 text-lg text-gray-500">
          Εγγραφείτε στο σύστημα ή{" "}
          <a href="/login" className="text-blue-600">
            συνδεθείτε
          </a>{" "}
          εαν έχετε ήδη λογαριασμό.
        </p>
        <div class="mt-8 grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          <div class="grid grid-cols-1 gap-6">
            <div class="flex gap-2">
              <label class="flex-auto w-1/2">
                <span class="text-gray-700 font-bold">Όνομα</span>
                <input
                  type="text"
                  class="form-input mt-1 block w-full"
                  placeholder="Δημήτρης"
                />
              </label>
              <label class="flex-auto w-1/2">
                <span class="text-gray-700 font-bold">Επώνυμο</span>
                <input
                  type="text"
                  class="form-input mt-1 block w-full"
                  placeholder="Βαρουτάς"
                />
              </label>
            </div>
            <label class="block">
              <span class="text-gray-700 font-bold">Εmail</span>
              <input
                type="email"
                class="form-input mt-1 block w-full"
                placeholder="dhmhtrhsv@hotmail.com"
              />
            </label>
            <label class="block">
              <span class="text-gray-700 font-bold">Κωδικός πρόσβασης</span>    {/*bale toggle hide/show pswd me hook ktl*/}
              <input
                type="password"
                class="form-input mt-1 block w-full"
                placeholder="Εισάγετε τον κωδικό σας"
              />
            </label>
            <label class="block">
              <span class="text-gray-700 font-bold">Κωδικός πρόσβασης (επανάληψη)</span>
              <input
                type="password"
                class="form-input mt-1 block w-full"
                placeholder="Εισάγετε τον κωδικό σας"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
