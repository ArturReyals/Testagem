// src/services/firebaseService.js

import {
  collection, doc, getDocs, getDoc,
  addDoc, updateDoc, deleteDoc,
  setDoc, query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { auth, db, storage } from '../firebase';

import { sendPasswordResetEmail } from 'firebase/auth';




// ─── PETS ────────────────────────────────────────────────────────────────────

export async function getPets() {
  const snap = await getDocs(collection(db, 'pets'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getPetById(id) {
  const snap = await getDoc(doc(db, 'pets', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function addPet(petData) {
  const docRef = await addDoc(collection(db, 'pets'), {
    ...petData,
    criadoEm: serverTimestamp(),
  });
  return docRef.id;
}

export async function updatePet(id, petData) {
  await updateDoc(doc(db, 'pets', id), { ...petData, atualizadoEm: serverTimestamp() });
}

export async function deletePet(id) {
  await deleteDoc(doc(db, 'pets', id));
}

// ─── UPLOAD DE IMAGEM ────────────────────────────────────────────────────────

export async function uploadImagem(file, folder = 'pets') {
  const nomeArquivo = `${folder}/${Date.now()}_${file.name}`;
  const storageRef  = ref(storage, nomeArquivo);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// ─── SOLICITAÇÕES DE ADOÇÃO (COM DADOS CADASTRAIS) ───────────────────────────

export async function getSolicitacoes() {
  const snap = await getDocs(
    query(collection(db, 'solicitacoes'), orderBy('criadoEm', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getSolicitacoesByUsuario(uid) {
  const snap = await getDocs(
    query(collection(db, 'solicitacoes'), where('usuarioId', '==', uid), orderBy('criadoEm', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addSolicitacao(dados) {
  const usuarioAtual = auth.currentUser;
  if (!usuarioAtual) throw new Error("Usuário não autenticado");

  const userSnap = await getDoc(doc(db, 'usuarios', usuarioAtual.uid));
  const userData = userSnap.exists() ? userSnap.data() : {};

  return await addDoc(collection(db, 'solicitacoes'), {
    ...dados,
    usuarioId: usuarioAtual.uid,
    cpf: userData.cpf || 'Não informado',
    endereco: userData.endereco || 'Não informado',
    status: 'pendente',
    protocolo: 'ADOC-' + Date.now().toString().slice(-6),
    criadoEm: serverTimestamp(),
  });
}

export async function updateSolicitacao(id, novoStatus) {
  await updateDoc(doc(db, 'solicitacoes', id), {
    status: novoStatus,
    atualizadoEm: serverTimestamp(),
  });
}

// ─── AGENDAMENTOS (COM DADOS CADASTRAIS) ─────────────────────────────────────

export async function getAgendamentos() {
  const snap = await getDocs(
    query(collection(db, 'agendamentos'), orderBy('criadoEm', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAgendamentosByUsuario(uid) {
  const snap = await getDocs(
    query(collection(db, 'agendamentos'), where('usuarioId', '==', uid), orderBy('criadoEm', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addAgendamento(dados) {
  const usuarioAtual = auth.currentUser;
  if (!usuarioAtual) throw new Error("Usuário não autenticado");

  const userSnap = await getDoc(doc(db, 'usuarios', usuarioAtual.uid));
  const userData = userSnap.exists() ? userSnap.data() : {};

  return await addDoc(collection(db, 'agendamentos'), {
    ...dados,
    usuarioId: usuarioAtual.uid,
    cpf: userData.cpf || 'Não informado',
    endereco: userData.endereco || 'Não informado',
    status: 'pendente',
    protocolo: 'AGD-' + Date.now().toString().slice(-6),
    criadoEm: serverTimestamp(),
  });
}

export async function updateAgendamento(id, dados) {
  await updateDoc(doc(db, 'agendamentos', id), {
    ...dados,
    atualizadoEm: serverTimestamp(),
  });
}

// ─── DOAÇÕES ─────────────────────────────────────────────────────────────────

export async function getDoacoes() {
  const snap = await getDocs(
    query(collection(db, 'doacoes'), orderBy('criadoEm', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getDoacoesByUsuario(uid) {
  const snap = await getDocs(
    query(collection(db, 'doacoes'), where('usuarioId', '==', uid), orderBy('criadoEm', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addDoacao(dados) {
  const usuarioAtual = auth.currentUser;
  return await addDoc(collection(db, 'doacoes'), {
    ...dados,
    usuarioId: usuarioAtual ? usuarioAtual.uid : '',
    protocolo: 'DOA-' + Date.now().toString().slice(-6),
    criadoEm: serverTimestamp(),
  });
}

// ─── AUTENTICAÇÃO E PERFIL ──────────────────────────────────────────────────

export async function cadastrarUsuario({ nome, email, senha, telefone, cpf, endereco }) {
  const cred = await createUserWithEmailAndPassword(auth, email, senha);
  const uid  = cred.user.uid;
  await setDoc(doc(db, 'usuarios', uid), {
    nome,
    email,
    telefone: telefone || '',
    cpf:      cpf      || '',
    endereco: endereco || '',
    role:     'visitante',
    criadoEm: serverTimestamp(),
  });
  return { uid, nome, email, role: 'visitante' };
}

export async function loginUsuario(email, senha) {
  const cred    = await signInWithEmailAndPassword(auth, email, senha);
  const uid     = cred.user.uid;
  const perfil  = await getDoc(doc(db, 'usuarios', uid));
  if (!perfil.exists()) throw new Error('Perfil não encontrado.');
  return { uid, ...perfil.data() };
}

export async function logoutUsuario() {
  await signOut(auth);
}

export function escutarAuth(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) { callback(null); return; }
    try {
      const snap = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
      callback(snap.exists() ? { uid: firebaseUser.uid, ...snap.data() } : null);
    } catch {
      callback(null);
    }
  });
}

export async function buscarDadosUsuario(uid) {
  const docSnap = await getDoc(doc(db, 'usuarios', uid));
  return docSnap.exists() ? docSnap.data() : { nome: '', telefone: '', endereco: '', cpf: '' };
}

export async function atualizarDadosUsuario(uid, dados) {
  await updateDoc(doc(db, 'usuarios', uid), dados);
}

// ─── USUÁRIOS (admin) ────────────────────────────────────────────────────────

export async function getUsuarios() {
  const snap = await getDocs(collection(db, 'usuarios'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ✅ FUNÇÃO RESTAURADA QUE ESTAVA FALTANDO
export async function seedPets() {
  const SEED = [
    { nome:'Bolinha', tipo:'cachorro', sexo:'Macho', idade:'3 anos', porte:'medio', localizacao:'Fortaleza', descricao:'Bolinha é um cão dócil e brincalhão.', vacinado:true, castrado:false, foto:'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=60', status:'disponivel' },
    { nome:'Mia', tipo:'gato', sexo:'Fêmea', idade:'1 ano', porte:'pequeno', localizacao:'Fortaleza', descricao:'Mia é uma gatinha carinhosa e curiosa.', vacinado:true, castrado:true, foto:'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=60', status:'disponivel' },
    { nome:'Thor', tipo:'cachorro', sexo:'Macho', idade:'4 meses', porte:'grande', localizacao:'Caucaia', descricao:'Thor ainda é filhote, cheio de energia!', vacinado:true, castrado:false, foto:'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&q=60', status:'disponivel' },
  ];
  for (const pet of SEED) {
    await addDoc(collection(db, 'pets'), { ...pet, criadoEm: serverTimestamp() });
  }
}

export async function resetarSenha(email) {
  return await sendPasswordResetEmail(auth, email);
}