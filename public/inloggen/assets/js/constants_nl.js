(function() {
  window.path_locale = '';

  if (!window.constants) {
    window.constants = {};
  }

  window.constants.spacerUrl = "/assets/spacer-6f74789becaaf52f2a295b5690545b4acf0582172bdaf0b1277e3d554afc5ea5.gif";

  window.constants.extra_sms_check_dialog_message = "U heeft nog geen telefoonnummer ingevuld. Als u uw telefoonnummer invult, dan kunt u extra veilig inloggen met een sms-code of DigiD app. Sommige organisaties vereisen dat u op deze manier inlogt. In dat geval kunt u alleen inloggen als u uw telefoonnummer heeft opgegeven in Mijn DigiD.";

  window.constants.warning_two_factor_deactivate_app_other_authenticators = "U heeft ingesteld dat u altijd wilt inloggen in minimaal 2 stappen, zoals met de DigiD app. <br><br> Weet u zeker dat u de DigiD app wilt deactiveren?";

  window.constants.warning_two_factor_deactivate_app_last_authenticator = "U heeft ingesteld dat u altijd wilt inloggen in minimaal 2 stappen. U kunt de DigiD app pas deactiveren als u uw instelling wijzigt. <br><br> Wilt u deze instelling aanpassen?";

  window.constants.is_digid_app_not_installed_notice = "Staat de DigiD app niet op dit apparaat? Download de DigiD app en activeer deze. Of annuleer en gebruik een andere manier van inloggen.";

  window.constants.regexes = {
    capitals: /[A-Z]/g,
    digits: /\d/g,
    email: /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/i,
    email_len_to_at_sign: /^.{1,64}@.*$/i,
    idNumber: /^[a-zA-Z]{2}[a-zA-Z0-9]{6}[0-9]$/,
    idNumberForeign: /^[A-Za-z0-9]{1,25}$/,
    miniscules: /[a-z]/g,
    specialCharacters: /[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]/g,
    only: {
      bsn_format: /^\d{8,9}$/,
      house_number_addition: /^[a-zA-Z0-9]{1,4}$/,
      house_number: /^\d{1,5}$/,
      password: /^[\x21-\x7E]*$/,
      postal_code: /^\d{4} ?[a-zA-Z]{2}$/,
      username: /^[\x21-\x7E]*$/
    }
  };

  window.constants.show_password = "Toon wachtwoord";

  window.constants.hide_password = "Verberg wachtwoord";

  window.constants.log_in = "Inloggen";

  window.constants.next = "Volgende";

  window.constants.answerVisible = "Dit antwoord wordt momenteel getoond. Selecteer de vraag om het antwoord weer te sluiten.";

  window.constants.answerHidden = "Dit antwoord is momenteel verborgen. Selecteer de vraag om het antwoord te openen.";

  window.constants.information_boxes = {
    aria_labels_close_prefix: "Sluiten"
  };

  window.constants.spokenSmsMessagesIsEnabled = "<strong>Let op!</strong> U vult een vast telefoonnummer in. DigiD heeft daarom gesproken sms-berichten geactiveerd.";

  window.constants.show_password_button = "Houd het oogje ingedrukt om wachtwoord te tonen";

  window.constants.show_password_button_keyboard = "Druk op de 'Enter'-toets en navigeer terug naar het wachtwoord. Het wachtwoord wordt dan tijdelijk getoond en opgelezen.";

  window.constants.actionTexts = {
    "annie_are_you_okay": "OK",
    "cancel_ok": "OK",
    "cancel": "Annuleren",
    "yeah": "Ja",
    "continue_without_phone_number": "Nee, verdergaan",
    "ok_without_phone_number": "OK, invullen",
    "download_the_app": "Download de app"
  };

  window.constants.something_wrong = "<strong>Er is iets fout gegaan.</strong><br /><br />";

  window.constants.validationMessages = {
    "account": {
      "adres": {
        "blank": "\u003cstrong\u003eU heeft het veld \"E-mailadres\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
        "invalid": "\u003cstrong\u003eVul een geldig e-mailadres in.\u003c/strong\u003e",
        "tooLong": "\u003cstrong\u003eHet veld \"E-mailadres\" mag maximaal 254 karakters bevatten.\u003c/strong\u003e"
      },
      "email_attributes": {
        "adres": {
          "blank": "\u003cstrong\u003eU heeft het veld \"E-mailadres\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
          "invalid": "\u003cstrong\u003eVul een geldig e-mailadres in.\u003c/strong\u003e",
          "input_or_checkbox": "U moet een e-mailadres invullen, of aanvinken dat u geen e-mailadres wilt opgeven. Uw e-mailadres wordt gebruikt om u te informeren bij belangrijke wijzigingen van uw DigiD.",
          "tooLong": "\u003cstrong\u003eHet veld \"E-mailadres\" mag maximaal 254 karakters bevatten.\u003c/strong\u003e"
        }
      },
      "password_authenticator_attributes": {
        "username": {
          "blank": "\u003cstrong\u003eU heeft het veld \"Gebruikersnaam\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
          "invalid": "\u003cstrong\u003eDe gekozen gebruikersnaam bevat karakters die niet zijn toegestaan.\u003c/strong\u003e \u003cbr /\u003eToegestaan zijn cijfers, letters en leestekens (geen spaties).",
          "tooLong": "\u003cstrong\u003eVul een gebruikersnaam in van minimaal 6 en maximaal 32 karakters.\u003c/strong\u003e",
          "tooShort": "\u003cstrong\u003eVul een gebruikersnaam in van minimaal 6 en maximaal 32 karakters.\u003c/strong\u003e"
        },
        "password": {
          "blank": "\u003cstrong\u003eU heeft het veld \"Wachtwoord\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
          "invalid": "\u003cstrong\u003eUw wachtwoord bevat karakters die niet zijn toegestaan. Toegestaan zijn cijfers, letters en leestekens (geen spaties).\u003c/strong\u003e",
          "tooFewCapitals": "\u003cstrong\u003eUw wachtwoord moet minimaal 1 hoofdletter bevatten.\u003c/strong\u003e",
          "tooFewDigits": "\u003cstrong\u003eUw wachtwoord moet minimaal 1 cijfer bevatten.\u003c/strong\u003e",
          "tooFewMinuscules": "\u003cstrong\u003eUw wachtwoord moet minimaal 1 kleine letter bevatten.\u003c/strong\u003e",
          "tooFewSpecialCharacters": "\u003cstrong\u003eUw wachtwoord moet minimaal 1 leesteken (!@#$%^...) bevatten.\u003c/strong\u003e",
          "tooLong": "\u003cstrong\u003eUw wachtwoord mag maximaal 32 karakters lang zijn.\u003c/strong\u003e",
          "tooShort": "\u003cstrong\u003eUw wachtwoord moet minimaal 8 karakters lang zijn.\u003c/strong\u003e"
        },
        "password_confirmation": {
          "blank": "\u003cstrong\u003eU heeft het veld \"Herhaal wachtwoord\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
          "confirmation": "\u003cstrong\u003eVul tweemaal hetzelfde wachtwoord in.\u003c/strong\u003e"
        }
      },
      "sms_tools_attributes": {
        "phone_number": {
          "blank": "\u003cstrong\u003eU heeft het veld \"Telefoonnummer\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
          "tooLong": "\u003cstrong\u003eUw telefoonnummer mag maximaal 30 karakters lang zijn.\u003c/strong\u003e",
          "tooShort": "\u003cstrong\u003eUw telefoonnummer moet minstens 10 karakters lang zijn.\u003c/strong\u003e",
          "invalid": "\u003cstrong\u003eVul een geldig telefoonnummer in.\u003c/strong\u003e"
        }
      }
    },
    "authenticators_sms_tool": {
      "phone_number": {
        "blank": "\u003cstrong\u003eU heeft het veld \"Telefoonnummer\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
        "tooLong": "\u003cstrong\u003eUw telefoonnummer mag maximaal 30 karakters lang zijn.\u003c/strong\u003e",
        "tooShort": "\u003cstrong\u003eUw telefoonnummer moet minstens 10 karakters lang zijn.\u003c/strong\u003e",
        "invalid": "\u003cstrong\u003eVul een geldig telefoonnummer in.\u003c/strong\u003e"
      }
    },
    "account_to_recover": {
      "password": {
        "blank": "\u003cstrong\u003eU heeft het veld \"Nieuw wachtwoord\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
        "invalid": "\u003cstrong\u003eUw wachtwoord bevat karakters die niet zijn toegestaan. Toegestaan zijn cijfers, letters en leestekens (geen spaties).\u003c/strong\u003e",
        "tooFewCapitals": "\u003cstrong\u003eUw wachtwoord moet minimaal 1 hoofdletter bevatten.\u003c/strong\u003e",
        "tooFewDigits": "\u003cstrong\u003eUw wachtwoord moet minimaal 1 cijfer bevatten.\u003c/strong\u003e",
        "tooFewMinuscules": "\u003cstrong\u003eUw wachtwoord moet minimaal 1 kleine letter bevatten.\u003c/strong\u003e",
        "tooFewSpecialCharacters": "\u003cstrong\u003eUw wachtwoord moet minimaal 1 leesteken (!@#$%^...) bevatten.\u003c/strong\u003e",
        "tooLong": "\u003cstrong\u003eUw wachtwoord mag maximaal 32 karakters lang zijn.\u003c/strong\u003e",
        "tooShort": "\u003cstrong\u003eUw wachtwoord moet minimaal 8 karakters lang zijn.\u003c/strong\u003e"
      },
      "password_confirmation": {
        "blank": "\u003cstrong\u003eU heeft het veld \"Herhaal wachtwoord\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
        "confirmation": "\u003cstrong\u003eVul tweemaal hetzelfde wachtwoord in.\u003c/strong\u003e"
      }
    },
    "activationcode": {
      "activationcode": {
        "blank": "\u003cstrong\u003eDit is een verplicht veld.\u003c/strong\u003e \u003cbr/\u003eVoer de activeringscode in.",
        "invalid": "\u003cstrong\u003eDe activeringscode begint met een 'A'.\u003c/strong\u003e\u003cbr /\u003eControleer of u de code juist heeft ingevuld.",
        "tooShort": "\u003cstrong\u003eHet veld \"Activeringscode\" moet minstens 9 karakters bevatten.\u003c/strong\u003e"
      }
    },
    "authentication": {
      "username": {
        "blank": "\u003cstrong\u003eU heeft het veld \"DigiD gebruikersnaam\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld."
      },
      "password": {
        "blank": "\u003cstrong\u003eU heeft het veld \"Wachtwoord\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld."
      },
      "test_zekerheidsniveau": {
        "blank": "\u003cstrong\u003eSelecteer een betrouwbaarheidsniveau.\u003c/strong\u003e"
      }
    },
    "email": {
      "address": {
        "blank": "\u003cstrong\u003eU heeft het veld \"E-mailadres\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
        "invalid": "\u003cstrong\u003eVul een geldig e-mailadres in.\u003c/strong\u003e",
        "tooLong": "\u003cstrong\u003eHet veld \"E-mailadres\" mag maximaal 254 karakters bevatten.\u003c/strong\u003e"
      }
    },
    "email_code": {
      "code": {
        "blank": "\u003cstrong\u003eU heeft het veld \"E-mailcode\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
        "invalid": "\u003cstrong\u003eDe e-mailcode begint met een 'E'.\u003c/strong\u003e \u003cbr /\u003eControleer of u de code juist heeft ingevuld.",
        "tooShort": "\u003cstrong\u003eHet veld \"E-mailcode\" moet minstens 9 karakters bevatten.\u003c/strong\u003e"
      }
    },
    "password_changing_account": {
      "current_password": {
        "blank": "\u003cstrong\u003eU heeft het veld \"Huidig wachtwoord\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld."
      },
      "password": {
        "blank": "\u003cstrong\u003eU heeft het veld \"Nieuw wachtwoord\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
        "invalid": "\u003cstrong\u003eUw wachtwoord bevat karakters die niet zijn toegestaan. Toegestaan zijn cijfers, letters en leestekens (geen spaties).\u003c/strong\u003e",
        "tooFewCapitals": "\u003cstrong\u003eUw wachtwoord moet minimaal 1 hoofdletter bevatten.\u003c/strong\u003e",
        "tooFewDigits": "\u003cstrong\u003eUw wachtwoord moet minimaal 1 cijfer bevatten.\u003c/strong\u003e",
        "tooFewMinuscules": "\u003cstrong\u003eUw wachtwoord moet minimaal 1 kleine letter bevatten.\u003c/strong\u003e",
        "tooFewSpecialCharacters": "\u003cstrong\u003eUw wachtwoord moet minimaal 1 leesteken (!@#$%^...) bevatten.\u003c/strong\u003e",
        "tooLong": "\u003cstrong\u003eUw wachtwoord mag maximaal 32 karakters lang zijn.\u003c/strong\u003e",
        "tooShort": "\u003cstrong\u003eUw wachtwoord moet minimaal 8 karakters lang zijn.\u003c/strong\u003e"
      },
      "password_confirmation": {
        "blank": "\u003cstrong\u003eU heeft het veld \"Herhaal wachtwoord\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
        "confirmation": "\u003cstrong\u003eVul tweemaal hetzelfde wachtwoord in.\u003c/strong\u003e"
      }
    },
    "password_verification": {
      "password": {
        "invalid": "\u003cstrong\u003eHet wachtwoord is onjuist.\u003c/strong\u003e \u003cbr /\u003eControleer de gegevens.",
        "blank": "\u003cstrong\u003eU heeft het veld \"Wachtwoord\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld."
      }
    },
    "recover_account": {
      "burgerservicenummer": {
        "blank": "\u003cstrong\u003eU heeft het veld \"Burgerservicenummer\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
        "invalid": "\u003cstrong\u003eGeef een geldig Burgerservicenummer (BSN) op.\u003c/strong\u003e",
        "invalid_8": "\u003cstrong\u003eEen burgerservicenummer (BSN) bestaat uit 8 of 9 cijfers.\u003c/strong\u003e\u003cbr /\u003eAls uw BSN uit 8 cijfers bestaat, voeg dan aan het begin een nul toe. Bijvoorbeeld: 12345678 wordt 012345678."
      },
      "username": {
        "blank": "\u003cstrong\u003eU heeft het veld \"Gebruikersnaam\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld."
      }
    },
    "recovery_code": {
      "herstelcode": {
        "blank": "\u003cstrong\u003eU heeft het veld \"Herstelcode\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
        "invalid": "\u003cstrong\u003eDe herstelcode begint met een 'H'.\u003c/strong\u003e\u003cbr/\u003eControleer of u de code juist heeft ingevuld.",
        "tooShort": "\u003cstrong\u003eHet veld \"Herstelcode\" moet minstens 9 karakters bevatten.\u003c/strong\u003e"
      }
    },
    "recover_username": {
      "burgerservicenummer": {
        "blank": "\u003cstrong\u003eU heeft het veld \"Burgerservicenummer\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
        "invalid": "\u003cstrong\u003eGeef een geldig Burgerservicenummer (BSN) op.\u003c/strong\u003e",
        "invalid_8": "\u003cstrong\u003eEen burgerservicenummer (BSN) bestaat uit 8 of 9 cijfers.\u003c/strong\u003e\u003cbr /\u003eAls uw BSN uit 8 cijfers bestaat, voeg dan aan het begin een nul toe. Bijvoorbeeld: 12345678 wordt 012345678."
      },
      "wachtwoord": {
        "blank": "\u003cstrong\u003eU heeft het veld \"Wachtwoord\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld."
      },
      "herstelcode": {
        "blank": "\u003cstrong\u003eU heeft het veld \"Herstelcode\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
        "invalid": "\u003cstrong\u003eDe herstelcode begint met een 'H'.\u003c/strong\u003e\u003cbr/\u003eControleer of u de code juist heeft ingevuld.",
        "tooShort": "\u003cstrong\u003eHet veld \"Herstelcode\" moet minstens 9 karakters bevatten.\u003c/strong\u003e"
      },
      "smscode": {
        "blank": "\u003cstrong\u003eU heeft het veld \"Sms-code\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
        "invalid": "\u003cstrong\u003eDe sms-code moet uit 6 cijfers bestaan.\u003c/strong\u003e \u003cbr/\u003eControleer of u de code juist heeft ingevuld."
      }
    },
    "wid_revocation_code": {
      "intrekkingscode": {
        "invalid": "Vul een geldige intrekkingscode in."
      }
    },
    "app_verification_code": {
      "verification_code": {
        "blank": "Dit is een verplicht veld. Voer de koppelcode in.",
        "invalid": "De koppelcode bestaat uit vier medeklinkers. Controleer of u de code juist heeft ingevuld."
      }
    },
    "registration": {
      "burgerservicenummer": {
        "blank": "\u003cstrong\u003eU heeft het veld \"Burgerservicenummer\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
        "invalid": "\u003cstrong\u003eGeef een geldig Burgerservicenummer (BSN) op.\u003c/strong\u003e",
        "invalid_8": "\u003cstrong\u003eEen burgerservicenummer (BSN) bestaat uit 8 of 9 cijfers.\u003c/strong\u003e\u003cbr /\u003eAls uw BSN uit 8 cijfers bestaat, voeg dan aan het begin een nul toe. Bijvoorbeeld: 12345678 wordt 012345678."
      },
      "geboortedatum_dag": {
        "blank": "\u003cstrong\u003eVul bij de dag een geldig cijfer in (01 t/m 31).\u003c/strong\u003e\u003cbr /\u003eIs uw geboortedag niet bekend, vul dan 00 in.",
        "invalid": "\u003cstrong\u003eVul bij de dag een geldig cijfer in (01 t/m 31).\u003c/strong\u003e\u003cbr /\u003eIs uw geboortedag niet bekend, vul dan 00 in.",
        "date_blank": "\u003cstrong\u003eU heeft het veld \"Geboortedatum\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld."
      },
      "geboortedatum_maand": {
        "blank": "\u003cstrong\u003eVul bij de maand een geldig cijfer in (01 t/m 12).\u003c/strong\u003e\u003cbr /\u003eIs uw geboortemaand niet bekend, vul dan voor zowel de dag als de maand 00 in.",
        "invalid": "\u003cstrong\u003eVul bij de maand een geldig cijfer in (01 t/m 12).\u003c/strong\u003e\u003cbr /\u003eIs uw geboortemaand niet bekend, vul dan voor zowel de dag als de maand 00 in."
      },
      "geboortedatum_jaar": {
        "blank": "\u003cstrong\u003eVul een geldig jaartal met 4 cijfers in.\u003c/strong\u003e\u003cbr /\u003eIs uw geboortejaar niet bekend, vul dan bij dag en maand 00 in en bij jaar 0000.",
        "invalid": "\u003cstrong\u003eVul een geldig jaartal met 4 cijfers in.\u003c/strong\u003e\u003cbr /\u003eIs uw geboortejaar niet bekend, vul dan bij dag en maand 00 in en bij jaar 0000.",
        "invalid_future": "\u003cstrong\u003eEen geboortedatum moet in het verleden liggen.\u003c/strong\u003e"
      },
      "huisnummer": {
        "invalid": "\u003cstrong\u003eHuisnummer: vul hier alleen cijfers in.\u003c/strong\u003e"
      },
      "huisnummertoevoeging": {
        "invalid": "\u003cstrong\u003eHuisnummer toevoeging: gebruik alleen letters en cijfers.\u003c/strong\u003e"
      },
      "postcode": {
        "invalid": "\u003cstrong\u003eVul een geldige postcode in.\u003c/strong\u003e\u003cbr /\u003eEen postcode bestaat uit 4 cijfers gevolgd door 2 letters."
      }
    },
    "registration_balie": {
      "burgerservicenummer": {
        "blank": "\u003cstrong\u003eU heeft het veld \"Burgerservicenummer\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
        "invalid": "\u003cstrong\u003eGeef een geldig Burgerservicenummer (BSN) op.\u003c/strong\u003e",
        "invalid_8": "\u003cstrong\u003eEen burgerservicenummer (BSN) bestaat uit 8 of 9 cijfers.\u003c/strong\u003e\u003cbr /\u003eAls uw BSN uit 8 cijfers bestaat, voeg dan aan het begin een nul toe. Bijvoorbeeld: 12345678 wordt 012345678."
      },
      "geboortedatum_dag": {
        "blank": "\u003cstrong\u003eVul bij de dag een geldig cijfer in (01 t/m 31).\u003c/strong\u003e\u003cbr /\u003eIs uw geboortedag niet bekend, vul dan 00 in.",
        "invalid": "\u003cstrong\u003eVul bij de dag een geldig cijfer in (01 t/m 31).\u003c/strong\u003e\u003cbr /\u003eIs uw geboortedag niet bekend, vul dan 00 in.",
        "date_blank": "\u003cstrong\u003eU heeft het veld \"Geboortedatum\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld."
      },
      "geboortedatum_maand": {
        "blank": "\u003cstrong\u003eVul bij de maand een geldig cijfer in (01 t/m 12).\u003c/strong\u003e\u003cbr /\u003eIs uw geboortemaand niet bekend, vul dan voor zowel de dag als de maand 00 in.",
        "invalid": "\u003cstrong\u003eVul bij de maand een geldig cijfer in (01 t/m 12).\u003c/strong\u003e\u003cbr /\u003eIs uw geboortemaand niet bekend, vul dan voor zowel de dag als de maand 00 in."
      },
      "geboortedatum_jaar": {
        "blank": "\u003cstrong\u003eVul een geldig jaartal met 4 cijfers in.\u003c/strong\u003e\u003cbr /\u003eIs uw geboortejaar niet bekend, vul dan bij dag en maand 00 in en bij jaar 0000.",
        "invalid": "\u003cstrong\u003eVul een geldig jaartal met 4 cijfers in.\u003c/strong\u003e\u003cbr /\u003eIs uw geboortejaar niet bekend, vul dan bij dag en maand 00 in en bij jaar 0000.",
        "invalid_future": "\u003cstrong\u003eEen geboortedatum moet in het verleden liggen.\u003c/strong\u003e"
      },
      "valid_until_day": {
        "blank": "\u003cstrong\u003eU heeft geen 'Geldig tot'-dag ingevuld.\u003c/strong\u003e \u003cbr/\u003eDit is een verplicht veld.",
        "invalid": "\u003cstrong\u003eU heeft een ongeldige dag ingevuld bij de 'geldig tot'-datum van uw paspoort of identiteitskaart.\u003c/strong\u003e\u003cbr/\u003eVul bij de dag een geldig cijfer in (01 t/m 31).",
        "date_blank": "\u003cstrong\u003eU heeft het veld \"Identiteitsdocument geldig tot\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld."
      },
      "valid_until_month": {
        "blank": "\u003cstrong\u003eU heeft geen 'Geldig tot'-maand ingevuld.\u003c/strong\u003e \u003cbr/\u003eDit is een verplicht veld.",
        "invalid": "\u003cstrong\u003eU heeft een ongeldige maand ingevuld bij de 'geldig tot'-datum van uw paspoort of identiteitskaart.\u003c/strong\u003e\u003cbr/\u003eVul bij de maand een geldig cijfer in (01 t/m 12)."
      },
      "valid_until_year": {
        "blank": "\u003cstrong\u003eU heeft geen 'Geldig tot'-jaar ingevuld.\u003c/strong\u003e \u003cbr/\u003eDit is een verplicht veld.",
        "invalid": "\u003cstrong\u003eU heeft een ongeldig jaartal ingevuld bij de 'geldig tot'-datum van uw paspoort of identiteitskaart.\u003c/strong\u003e\u003cbr/\u003eVul een geldig jaartal met 4 cijfers in.",
        "year_is_in_past": "\u003cstrong\u003eDe geldigheidsdatum van uw paspoort of identiteitskaart is verstreken.\u003c/strong\u003e\u003cbr/\u003eControleer de geldigheidsdatum van uw paspoort of identiteitskaart. Vraag eerst een nieuw paspoort of identiteitskaart aan indien de geldigheidsdatum is verstreken."
      },
      "id_number": {
        "blank": "\u003cstrong\u003eU heeft het veld \"Documentnummer\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
        "invalid": "\u003cstrong\u003eGeef een geldig documentnummer op van uw identiteitsbewijs\u003c/strong\u003e",
        "invalid_foreign": "\u003cstrong\u003eGeef een geldig Documentnummer op van uw identiteitsdocument. Gebruik alleen de tekens a t/m z, A t/m Z, en 0 t/m 9.\u003c/strong\u003e",
        "contains_o": "Een documentnummer bevat nooit de hoofdletter 'O'. Weet u zeker dat er geen cijfer '0' staat?"
      }
    },
    "smscode": {
      "smscode": {
        "blank": "\u003cstrong\u003eU heeft het veld \"Sms-code\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
        "invalid": "\u003cstrong\u003eDe sms-code moet uit 6 cijfers bestaan.\u003c/strong\u003e \u003cbr/\u003eControleer of u de code juist heeft ingevuld."
      }
    },
    "unblockingscode": {
      "unblockingscode": {
        "blank": "Dit is een verplicht veld. Voer de deblokkeringscode in.",
        "invalid": "\u003cstrong\u003eDe deblokkeringscode begint met een 'D'.\u003c/strong\u003e \u003cbr /\u003eControleer of u de code juist heeft ingevuld.",
        "wrong": "De deblokkeringscode is onjuist. Controleer of u deze juist hebt overgenomen en probeer het opnieuw."
      }
    },
    "app_activationcode": {
      "activationcode": {
        "blank": "\u003cstrong\u003eU heeft het veld \"Koppelcode\" niet ingevuld.\u003c/strong\u003e \u003cbr /\u003eDit is een verplicht veld.",
        "invalid": "De koppelcode begint met een ‘K’. Controleer of u de code juist heeft ingevuld.",
        "tooShort": "\u003cstrong\u003eHet veld \"Koppelcode\" moet exact 6 karakters bevatten.\u003c/strong\u003e"
      }
    }
  };

  window.asset_version = '1.9.31';

}).call(this);
