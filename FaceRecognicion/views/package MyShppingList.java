package trabalhoIP;
import java.util.Scanner;

public class IP_TP1_LEI_JoaoVieira_MartimMarques {
  public static void main(String[] args) {
    Scanner teclado = new Scanner(System.in);
    int tamMax = 100;

    String[] nome = new String[tamMax];
    double[] quanto = new double[tamMax];
    double[] preco = new double[tamMax];
    boolean[] feito = new boolean[tamMax];

    int nItens = 0;
    char opcao, opcaoF, opcaoL;
    int posARemover = 0;

    do {
      System.out.println(
          "(E)ditar listas \n(F)azer Compras \nFazer (c)ontas \n(S)air"); // Primeiro
                                                                          // menu

      opcao = teclado.next().charAt(0);
      switch (opcao) {
        case 'E':
          do {
            System.out.print("\n(I)nserir item no fim da lista.\r\n"
                + "Inserir item na (p)osição n da lista.\r\n"
                + "(A)pagar último item inserido na lista.\r\n"
                + "Apagar item na posição (n) da lista.\r\n"
                + "(a)pagar itens da posição m à n da lista.\r\n"
                + "(L)istar todos os itens.\r\n"
                + "(V)oltar");
            System.out.println();

            opcao = teclado.next().charAt(0);
            switch (opcao) {
              case 'I':
                if (nItens < tamMax) {
                  System.out.println("Insira o nome do produto: ");
                  String productName = teclado.next();

                  System.out.println("Insira a quantidade: ");
                  double quantidade = teclado.nextDouble();
                  while (quantidade <= 0) {
                    System.out.println(
                        "A quantidade introduzida é inválida, tente novamente: ");
                    quantidade = teclado.nextDouble();
                  }
                  double productQuant = quantidade;

                  System.out.println("Insira o preço: ");
                  double precoProd = teclado.nextDouble();
                  while (precoProd <= 0) {
                    System.out.println(
                        "Introduziu um preço inválido, tente novamente: ");
                    precoProd = teclado.nextDouble();
                  }
                  double productPreco = precoProd;

                  nome[nItens] = productName;
                  quanto[nItens] = productQuant;
                  preco[nItens] = productPreco;
                  feito[nItens] = false;

                  nItens++;

                  posARemover = nItens;

                  System.out.println("Produto adicionado com sucesso!");
                } else {
                  System.out.println(
                      "A lista está cheia. Não é possível adicionar mais itens.");
                }
                break;

              case 'p':
                if (nItens < tamMax) {
                  System.out.println(
                      "Insira a posição em que deseja inserir o produto: ");
                  int posicaoProd = teclado.nextInt();
                  while (posicaoProd < 0 || posicaoProd > nItens) {
                    System.out.println(
                        "A posição inserida é inválida, tente novamente: ");
                    posicaoProd = teclado.nextInt();
                  }

                  for (int i = nItens; i > posicaoProd; i--) {
                    nome[i] = nome[i - 1];
                    quanto[i] = quanto[i - 1];
                    preco[i] = preco[i - 1];
                    feito[i] = feito[i - 1];
                  }

                  System.out.println("Insira o nome do produto: ");
                  String productName = teclado.next();

                  System.out.println("Insira a quantidade: ");
                  double quantidade = teclado.nextDouble();
                  while (quantidade <= 0) {
                    System.out.println(
                        "A quantidade introduzida é inválida, tente novamente: ");
                    quantidade = teclado.nextDouble();
                  }
                  double productQuant = quantidade;

                  System.out.println("Insira o preço: ");
                  double precoProd = teclado.nextDouble();
                  while (precoProd <= 0) {
                    System.out.println(
                        "Introduziu um preço inválido, tente novamente: ");
                    precoProd = teclado.nextDouble();
                  }
                  double productPreco = precoProd;

                  nome[posicaoProd] = productName;
                  quanto[posicaoProd] = productQuant;
                  preco[posicaoProd] = productPreco;
                  feito[posicaoProd] = false;

                  System.out.println(
                      "O produto foi adicionado na posição " + posicaoProd);

                  posARemover = posicaoProd;

                  nItens++;

                } else
                  System.out.println(
                      "Não é possível adicionar mais itens uma vez que a lista está cheia");
                break;

              case 'A':
                if (nItens > 0) {
                  for (int i = posARemover; i < nItens - 1; i++) {
                    nome[i] = nome[i + 1];
                    quanto[i] = quanto[i + 1];
                    preco[i] = preco[i + 1];
                    feito[i] = feito[i + 1];
                  }
                  System.out.println("Último item removido com sucesso!");
                  nItens--;
                } else
                  System.out.println(
                      "A lista está vazia. Não há itens para remover.");
                break;

              case 'n':
                System.out.println(
                    "Insira a posição em que pretende eliminar: ");
                int posArr2 = teclado.nextInt();

                while (posArr2 < 0 || posArr2 >= nItens) {
                  System.out.println(
                      "A posição inserida não é válida, tente novamente: ");
                  posArr2 = teclado.nextInt();
                }

                System.out.println(
                    "\nProduto a ser removido: " + nome[posArr2]);

                for (int i = posArr2 + 1; i < nItens; i++) {
                  nome[i - 1] = nome[i];
                  quanto[i - 1] = quanto[i];
                  preco[i - 1] = preco[i];
                  feito[i - 1] = feito[i];
                }
                nItens--;

                nome[nItens] = "";
                quanto[nItens] = 0.0;
                preco[nItens] = 0.0;
                feito[nItens] = false;

                System.out.println("\nO produto foi removido com sucesso!");
                break;

              case 'a':
                System.out.println("Insira a posição onde começa a eliminar: ");
                int posInicial = teclado.nextInt();

                while (posInicial < 0 || posInicial >= nItens) {
                  System.out.println(
                      "A posição escolhida é inválida, insira uma posição válida");
                  posInicial = teclado.nextInt();
                }

                System.out.println(
                    "Insira a posição onde termina de eliminar: ");
                int posFinal = teclado.nextInt();

                while (posFinal < 0 || posFinal >= nItens) {
                  System.out.println(
                      "A posição escolhida é inválida, insira uma posição válida");
                  posFinal = teclado.nextInt();
                }

                int itensRemov = posFinal - posInicial + 1;

                for (int i = posFinal + 1; i < nItens; i++) {
                  nome[i - itensRemov] = nome[i];
                  quanto[i - itensRemov] = quanto[i];
                  preco[i - itensRemov] = preco[i];
                  feito[i - itensRemov] = feito[i];
                }

                nItens = nItens - itensRemov;

                System.out.println("Produto(s) removido(s) com sucesso!");
                break;
              case 'L':
                if (nItens < 0)
                  break;
                System.out.printf("%-10s%-20s%-20s%-20s%-5s\n", "", "Item",
                    "Quantidade", "Preco", "Compradas");
                for (int i = 0; i < nItens; i++) {
                  if (feito[i])
                    System.out.printf("%-10s%-20s%-20s%-20s%-5s\n", i, nome[i],
                        quanto[i], preco[i], "X");
                  else
                    System.out.printf("%-10s%-20s%-20s%-20s%-5s\n", i, nome[i],
                        quanto[i], preco[i], " ");
                }
                System.out.println();
                break;

              case 'V':
                break;

              default:
                System.out.println("Essa opção não está disponível");
                break;
            }
          } while (opcao != 'V');
          break;

        case 'F':
          do {
            System.out.println("(M)arcar primeiro item por comprar.\r\n"
                + "(D)esmarcar primeiro item comprado.\r\n"
                + "Trocar estado por (n)ome.\r\n"
                + "Trocar estado por (p)osição.\r\n"
                + "(L)istar.\r\n"
                + "(V)oltar.");

            opcaoF = teclado.next().charAt(0);
            boolean encontrado = false;

            switch (opcaoF) {
              case 'M':
                for (int i = 0; i < nItens; i++) {
                  if (!feito[i]) {
                    feito[i] = true;
                    encontrado = true;
                    break;
                  }
                }

                if (encontrado) {
                  System.out.println(
                      "Primeiro item por comprar marcado com sucesso!");
                } else {
                  System.out.println("Não há itens por comprar.");
                }
                teclado.nextLine();
                break;
              case 'D':
            	    if (nItens > 0) {
            	        // código para desmarcar o último item comprado
            	        for (int i = nItens - 1; i >= 0; i--) {
            	            if (feito[i]) {
            	                feito[i] = false;
            	                encontrado = true;
            	                posARemover = i; // Atualiza a posição a ser removida
            	                break;
            	            }
            	        }

            	        if (encontrado) {
            	            System.out.println("Último item por comprar desmarcado com sucesso!");
            	        } else {
            	            System.out.println("Não há itens por comprar.");
            	        }
            	    } else {
            	        System.out.println("A lista está vazia. Não há itens por comprar.");
            	    }
            	    break;
              case 'n':
                System.out.println("Insira o nome do produto: ");
                teclado.nextLine();
                String nomeProd = teclado.nextLine();

                for (int i = 0; i < nItens; i++) {
                  if (nomeProd.equalsIgnoreCase(nome[i])) {
                    feito[i] = !feito[i];
                    encontrado = true;
                    break;
                  }
                }

                if (encontrado) {
                  System.out.println("Estado do produto " + nomeProd
                      + " alterado com sucesso!");
                } else {
                  System.out.println(
                      "Não foi encontrado nenhum produto com o nome " + nomeProd
                      + ".");
                }
                break;
              case 'p':
                System.out.println("Insira a posição do produto: ");
                int posArr = teclado.nextInt();
                feito[posArr] = !feito[posArr];
                System.out.println("Estado do produto " + nome[posArr]
                    + " alterado com sucesso!");

                break;

              case 'L':
                do {
                  System.out.println("Listar (t)odos os itens.\n"
                      + "Listar itens (c)omprados.\n"
                      + "Listar itens (p)or comprar.\n"
                      + "(V)oltar");

                  opcaoL = teclado.next().charAt(0);

                  switch (opcaoL) {
                    case 't':
                      if (nItens > 0) {
                        System.out.printf("\n%-10s%-20s%-20s%-20s%-5s\n", "",
                            "Item", "Quantidade", "Preco", "Compradas");
                        for (int i = 0; i < nItens; i++) {
                          if (feito[i])
                            System.out.printf("%-10s%-20s%-20s%-20s%-5s\n", i,
                                nome[i], quanto[i], preco[i], "X");
                          else
                            System.out.printf("%-10s%-20s%-20s%-20s%-5s\n", i,
                                nome[i], quanto[i], preco[i], " ");
                        }
                      } else
                        System.out.println(
                            "A lista ainda não possui qualquer item");
                      System.out.println();
                      break;

                    case 'c':
                      if (nItens > 0) {
                        System.out.printf("\n%-10s%-20s%-20s%-20s%-5s\n", "",
                            "Item", "Quantidade", "Preco", "Compradas");
                        for (int i = 0; i < nItens; i++) {
                          if (feito[i]) {
                            System.out.printf("%-10s%-20s%-20s%-20s%-5s\n", i,
                                nome[i], quanto[i], preco[i], "X");
                          }
                        }
                      } else
                        System.out.println(
                            "A lista ainda não possui qualquer item");
                      System.out.println();
                      break;

                    case 'p':
                      if (nItens > 0) {
                        System.out.printf("\n%-10s%-20s%-20s%-20s%-5s\n", "",
                            "Item", "Quantidade", "Preco", "Compradas");
                        for (int i = 0; i < nItens; i++) {
                          if (!feito[i]) {
                            System.out.printf("%-10s%-20s%-20s%-20s%-5s\n", i,
                                nome[i], quanto[i], preco[i], " ");
                          }
                        }
                      } else
                        System.out.println(
                            "A lista ainda não possui qualquer item");
                      System.out.println();
                      break;

                    case 'V':
                      break;

                    default:
                      System.out.println("Essa opção não está disponível");
                  }
                } while (opcaoL != 'V');
                break;
              case 'V':
                break;

              default:
                System.out.println("Essa opção não está disponível\n");
            }
          } while (opcaoF != 'V');

          break;

        case 'c':
          do {
            System.out.println("Quanto custa a (l)ista?\r\n"
                + "Quanto já (g)astei?\r\n"
                + "Quanto custa o que (f)alta comprar?\r\n"
                + "Qual o preço (m)édio por item?\r\n"
                + "(V)oltar\r\n");

            opcao = teclado.next().charAt(0);

            double total = 0;
            double precoI = 0;

            switch (opcao) {
              case 'l':
                if (nItens > 0) {
                  for (int i = 0; i < nItens; i++) {
                    precoI = quanto[i] * preco[i];
                    total += precoI;
                  }
                  System.out.println(
                      "O custo total da lista é de " + total + "€.\n");
                } else
                  System.out.println("A lista esta vazia\n");
                break;
              case 'g':
                if (nItens > 0) {
                  for (int i = 0; i < nItens; i++) {
                    if (feito[i]) {
                      precoI = quanto[i] * preco[i];
                      total += precoI;
                    }
                  }
                  System.out.println(
                      "O custo total dos produtos comprados é de " + total
                      + "€.\n");
                } else
                  System.out.println("A lista esta vazia\n");
                break;
              case 'f':
                if (nItens > 0) {
                  for (int i = 0; i < nItens; i++) {
                    if (!feito[i]) {
                      precoI = quanto[i] * preco[i];
                      total += precoI;
                    }
                  }
                  System.out.println(
                      "O custo total dos produtos por comprar é de " + total
                      + "€.\n");
                } else
                  System.out.println("A lista esta vazia\n");
                break;

              case 'm':
            	  if(nItens > 0) {
						for(int i = 0; i < nItens; i++) {
						
							total +=  preco[i]; 
						}
						double precoMedio = total / nItens ;
						
						System.out.println("O preço medio por cada item é " + precoMedio + " €\n");
					}
					else
						System.out.println("A lista esta vazia\n");
					break;
              case 'V':
                break;

              default:
                System.out.println("Essa opção não está disponível");
                break;
            }
          } while (opcao != 'V');
        case 'S':
          break;
        default:
          System.out.println("Essa opção não está disponível");
      }
    } while (opcao != 'S');
    System.out.println("Obrigado por usar o nosso programa!");
  }
}