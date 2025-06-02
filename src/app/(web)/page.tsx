"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiSearch, FiBriefcase, FiUsers, FiTrendingUp, FiMapPin, FiClock } from "react-icons/fi";
import EnhancedButton from "@/components/ui/enhanced-button";
import EnhancedCard from "@/components/ui/enhanced-card";

export default function Home() {
  const stats = [
    { label: "Offres d'emploi", value: "1,200+", icon: FiBriefcase },
    { label: "Entreprises", value: "300+", icon: FiUsers },
    { label: "Candidats", value: "5,000+", icon: FiTrendingUp },
    { label: "Wilayas", value: "48", icon: FiMapPin },
  ];

  const featuredJobs = [
    {
      title: "Développeur Full Stack",
      company: "TechCorp Algeria",
      location: "Alger",
      type: "CDI",
      salary: "80,000 - 120,000 DA",
      logo: "/images/company-1.png",
      posted: "Il y a 2 jours"
    },
    {
      title: "Designer UI/UX",
      company: "Creative Studio",
      location: "Oran",
      type: "CDD",
      salary: "60,000 - 90,000 DA",
      logo: "/images/company-2.png",
      posted: "Il y a 1 jour"
    },
    {
      title: "Chef de Projet",
      company: "Business Solutions",
      location: "Constantine",
      type: "CDI",
      salary: "100,000 - 150,000 DA",
      logo: "/images/company-3.png",
      posted: "Il y a 3 heures"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold gradient-text mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Trouvez votre emploi idéal
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Découvrez des milliers d'opportunités d'emploi en Algérie et connectez-vous avec les meilleures entreprises
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link href="/users/offers">
                <EnhancedButton
                  size="lg"
                  icon={<FiSearch className="w-5 h-5" />}
                  className="min-w-[200px]"
                  glow
                >
                  Rechercher un emploi
                </EnhancedButton>
              </Link>

              <Link href="/candidates">
                <EnhancedButton
                  variant="secondary"
                  size="lg"
                  icon={<FiUsers className="w-5 h-5" />}
                  className="min-w-[200px]"
                >
                  Parcourir les candidats
                </EnhancedButton>
              </Link>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="card-enhanced p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Titre du poste, entreprise ou mot-clé..."
                      className="input-enhanced pl-12"
                    />
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>

                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Ville ou wilaya..."
                      className="input-enhanced pl-12"
                    />
                    <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>

                  <EnhancedButton size="lg" className="md:px-8">
                    Rechercher
                  </EnhancedButton>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-4">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Offres d'emploi en vedette
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez les dernières opportunités d'emploi des meilleures entreprises
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredJobs.map((job, index) => (
              <EnhancedCard
                key={index}
                variant="gradient"
                hover="lift"
                animation="slide-up"
                delay={index * 0.1}
                className="overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <FiBriefcase className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-gray-600 text-sm">{job.company}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {job.type}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FiMapPin className="w-4 h-4 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiClock className="w-4 h-4 mr-2" />
                      {job.posted}
                    </div>
                  </div>

                  <div className="text-lg font-semibold text-green-600 mb-4">
                    {job.salary}
                  </div>

                  <EnhancedButton fullWidth size="sm">
                    Postuler maintenant
                  </EnhancedButton>
                </div>
              </EnhancedCard>
            ))}
          </div>

          <div className="text-center">
            <Link href="/users/offers">
              <EnhancedButton variant="outline" size="lg">
                Voir toutes les offres
              </EnhancedButton>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à commencer votre carrière ?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de professionnels qui ont trouvé leur emploi idéal grâce à notre plateforme
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <EnhancedButton variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
                Créer un compte candidat
              </EnhancedButton>
              <EnhancedButton variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                Publier une offre
              </EnhancedButton>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
