export const typeDefs = `#graphql
  type Login {
    id: Int
    username: String
    role: String
    full_name: String
  }

  type DetailItem {
    id: Int
    username: String
    montant: Float
    date: String
  }

  type Employee {
    id: Int
    name: String
    department: String
  }

  type Chiffre {
    id: Int
    date: String
    recette_de_caisse: String
    total_diponce: String
    diponce: String # Stringified JSON
    diponce_divers: String # Stringified JSON
    diponce_journalier: String # Stringified JSON
    diponce_admin: String # Stringified JSON
    recette_net: String
    tpe: String
    cheque_bancaire: String
    espaces: String
    tickets_restaurant: String
    extra: String
    primes: String
    is_locked: Boolean
    # Bey Database Fields
    avances_details: [DetailItem]
    doublages_details: [DetailItem]
    extras_details: [DetailItem]
    primes_details: [DetailItem]
  }

  type Supplier {
    id: Int
    name: String
  }

  type Designation {
    id: Int
    name: String
    type: String
  }

  type SalaryHistory {
    month: String
    total: Float
  }

  type PaidUser {
    username: String
    amount: Float
  }

  type Invoice {
    id: Int
    supplier_name: String
    amount: String
    date: String
    photo_url: String
    photos: String # Stringified JSON array
    photo_cheque_url: String
    photo_verso_url: String
    status: String
    payment_method: String
    paid_date: String
    doc_type: String
    doc_number: String
    payer: String
    origin: String
    category: String
    updated_at: String
  }

  type BankDeposit {
    id: Int
    amount: String
    date: String
  }

    type SalaryRemainder {
    id: Int
    employee_name: String
    amount: Float
    month: String
    status: String
    updated_at: String
  }
    
    upsertSalaryRemainder(employee_name: String!, amount: Float!, month: String!, status: String): SalaryRemainder
    deleteSalaryRemainder(employee_name: String!, month: String!): Boolean
  }
`;
