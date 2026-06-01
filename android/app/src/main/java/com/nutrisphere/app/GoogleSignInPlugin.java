package com.nutrisphere.app;

import android.util.Log;

import androidx.credentials.ClearCredentialStateRequest;
import androidx.credentials.Credential;
import androidx.credentials.CustomCredential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.ClearCredentialException;
import androidx.credentials.exceptions.GetCredentialException;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.libraries.identity.googleid.GetGoogleIdOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;

import java.util.concurrent.Executors;

@CapacitorPlugin(name = "NativeGoogleAuth")
public class GoogleSignInPlugin extends Plugin {

    private static final String TAG = "NativeGoogleAuth";

    @PluginMethod
    public void signIn(PluginCall call) {
        String clientId = call.getString("clientId");
        if (clientId == null) {
            call.reject("clientId is required");
            return;
        }

        GetGoogleIdOption googleIdOption = new GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(false)
                .setServerClientId(clientId)
                .setAutoSelectEnabled(false)
                .build();

        GetCredentialRequest request = new GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOption)
                .build();

        CredentialManager credentialManager = CredentialManager.create(getContext());

        credentialManager.getCredentialAsync(
                getActivity(),
                request,
                null,
                Executors.newSingleThreadExecutor(),
                new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                    @Override
                    public void onResult(GetCredentialResponse result) {
                        Credential credential = result.getCredential();
                        try {
                            GoogleIdTokenCredential googleCred;
                            if (credential instanceof GoogleIdTokenCredential) {
                                googleCred = (GoogleIdTokenCredential) credential;
                            } else if (credential instanceof CustomCredential &&
                                    GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(credential.getType())) {
                                googleCred = GoogleIdTokenCredential.createFrom(((CustomCredential) credential).getData());
                            } else {
                                call.reject("Unexpected credential type: " + credential.getType());
                                return;
                            }
                            JSObject ret = new JSObject();
                            ret.put("idToken", googleCred.getIdToken());
                            call.resolve(ret);
                        } catch (Exception e) {
                            call.reject("Failed to parse credential: " + e.getMessage());
                        }
                    }

                    @Override
                    public void onError(GetCredentialException e) {
                        Log.e(TAG, "Sign-in error: " + e.getMessage());
                        call.reject(e.getMessage());
                    }
                }
        );
    }

    @PluginMethod
    public void signOut(PluginCall call) {
        CredentialManager credentialManager = CredentialManager.create(getContext());
        credentialManager.clearCredentialStateAsync(
                new ClearCredentialStateRequest(),
                null,
                Executors.newSingleThreadExecutor(),
                new CredentialManagerCallback<Void, ClearCredentialException>() {
                    @Override
                    public void onResult(Void result) {
                        call.resolve();
                    }

                    @Override
                    public void onError(ClearCredentialException e) {
                        call.reject(e.getMessage());
                    }
                }
        );
    }
}
